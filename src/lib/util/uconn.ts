import qs from 'qs';
import axios from 'axios';
import moment from 'moment';
import cheerio from 'cheerio';
import tableparse from 'cheerio-tableparser';

import { replaceAll } from '@ilefa/ivy';
import { decode as decodeEntity } from 'html-entities';

export const COURSE_IDENTIFIER = /^[a-zA-Z]{2,4}\d{4}(Q|E|W)*$/;
export const SECTION_IDENTIFIER = /^(H|Z|W|N)*\d{2,3}(L|D)*$/;

export type CoursePayload = {
    name: string;
    grading: string;
    credits: string;
    prereqs: string;
    lastDataMarker: Date;
    description: string;
    sections: SectionData[];
    professors: ProfessorData[];
}

export type SectionPayload = {
    name: string;
    grading: string;
    credits: string;
    prereqs: string;
    lastDataMarker: Date;
    description: string;
    section: SectionData;
}

export type SectionData = {
    internal: {
        termCode: string;
        classNumber: string;
        classSection: string;
        sessionCode: string;
    }
    term: string;
    mode: string;
    campus: string;
    instructor: string;
    section: string;
    schedule: string;
    location: {
        name: string;
        url?: string;
    };
    enrollment: {
        max: number;
        current: number;
        waitlist?: number;
        full: boolean;
    }
    notes: string;
}

export type ProfessorData = {
    name: string;
    sections: SectionData[];
    rmpIds: string[];
}

export type CampusType = 'any' 
                | 'storrs' 
                | 'hartford' 
                | 'stamford' 
                | 'waterbury' 
                | 'avery_point';

export type EnrollmentPayload = {
    course: {
        term: string;
        classNumber: string;
        section: string;
    };
    available: number;
    total: number;
    overfill: boolean;
    percent: number;
}

/**
 * Attempts to retrieve data regarding
 * a specific UConn course, and returns
 * all sections, metadata, and other related
 * data about it.
 * 
 * @param identifier a valid course identifier
 * @param campus a valid campus type
 */
export const searchCourse = async (identifier: string, campus: CampusType = 'any'): Promise<CoursePayload> => {
    if (!COURSE_IDENTIFIER.test(identifier)) {
        return null;
    }
    
    let prefix = identifier.split(/[0-9]/)[0].toUpperCase();
    let number = identifier.split(/[a-zA-Z]{2,4}/)[1];

    let target = `https://catalog.uconn.edu/directory-of-courses/course/${prefix}/${number}/`;
    let res = await axios
        .get(target)
        .then(res => res.data)
        .catch(_ => null);

    if (!res) {
        return null;
    }

    let $ = cheerio.load(res);
    tableparse($);

    let name = $('.single-course > h3:nth-child(2)')
        .text()
        .split(/\d{4}(?:Q|E|W)*\.\s/)[1];
        
    let grading = $('.grading-basis')
        .text()
        .trim()
        .split('Grading Basis: ')[1] || 'Graded';

    let credits = $('.credits')
        .text()
        .trim()
        .split(' ')[0] || 'Unknown Credits';

    let prereqs = $('.prerequisites')
        .text()?.
        trim()?.
        split('Prerequisites: ')[1]?.
        split('Prerequisite: ')[1]?.
        split('Recommended Preparation')[0] || 'There are no prerequisites for this course.';

    let lastDataRaw = $('.last-refresh').text() || moment().format('DD-MMM-YY h.mm.ss.[123456] a').toUpperCase();
    if (lastDataRaw.includes('.')) {
        lastDataRaw = replaceAll(lastDataRaw, '.', ':');
    }

    let lastDataMarker = new Date(lastDataRaw.split(/:\d{6}/).join(''));      

    let desc = $('.description').text() || 'There is no description provided for this course.';
    let sections: SectionData[] = [];

    let data: string[][] = ($('.tablesorter') as any).parsetable();
    if (!data[0]) {
        return {
            name, grading, credits,
            prereqs, lastDataMarker,
            description: desc,
            sections: [],
            professors: []
        };
    }

    let sectionCount = data[0].length - 1;

    for (let i = 0; i < sectionCount; i++) {
        let internalData = cheerio.load(data[0][i].trim());
        let term = data[1][i];
        let campus = decodeEntity(data[2][i]);
        let mode = decodeEntity(data[3][i]);
        let instructor = data[4][i]
            .replace('&nbsp;', ' ')
            .split(', ')
            .reverse()
            .join(' ');

        let section = data[5][i];
        let schedule = data[7][i];
        schedule = schedule.substring(0, schedule.length - 4);

        let location: string | any = data[8][i];
        let locationPayload = {} as any;
        if (location?.includes('classrooms.uconn.edu')) {
            location = cheerio.load(location);
            locationPayload.name = location('a').text();
            locationPayload.url = location('a').attr('href');
        } else {
            locationPayload.name = location;
        }

        let enrollment = data[9][i];
        let enrollmentPayload = {} as any;
        let spaces = enrollment.split('<')[0];
        let current = spaces.split('/')[0];
        let seats = spaces.split('/')[1];

        enrollmentPayload.max = seats;
        enrollmentPayload.current = current;
        enrollmentPayload.full = current >= seats;
        enrollmentPayload.waitlist = enrollment.includes('Waitlist Spaces:') 
            ? enrollment.split('Waitlist Spaces: ')[1] 
            : null;

        let notes = data[10][i];

        let virtual: SectionData = {
            internal: {
                termCode: internalData('span.term-code').text(),
                classNumber: internalData('span.class-number').text(),
                classSection: internalData('span.class-section').text(),
                sessionCode: internalData('span.session-code').text(),
            },
            term,
            mode,
            campus,
            instructor,
            section,
            schedule,
            location: locationPayload,
            enrollment: enrollmentPayload,
            notes
        }

        if (virtual.campus.toLowerCase() === 'off-campus') {
            continue;
        }

        sections.push(virtual);
    }

    if (campus !== 'any') {
        sections = sections.filter(section => 
            section
                .campus
                .replace(' ', '_')
                .toLowerCase() === campus.toLowerCase());
        sectionCount = sections.length;
    }
    
    let professors: ProfessorData[] = [];
    sections = sections.slice(1, sections.length);

    for (let section of sections) {
        let prof = section.instructor;
        if (professors.some(p => p.name === prof)) {
            continue;
        }

        let $ = await axios.get(`https://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=University+Of+Connecticut&query=${prof.replace(' ', '+')}`)
            .then(res => res.data)
            .then(data => cheerio.load(data))
            .catch(err => {
                console.error(err);
                return null;
            });

        let teaching = sections
            .filter(section => section.instructor === prof)
            .sort((a, b) => a.section.localeCompare(b.section));

        prof = decodeEntity(replaceAll(prof, '<br>', ' '));

        if (!$) {
            professors.push({
                name: prof,
                sections: teaching,
                rmpIds: []
            });
            continue;
        }

        let rmp: string[] = [];
        $('li.listing').each((i: number) => {
            let school = $(`li.listing:nth-child(${i + 1}) > a:nth-child(1) > span:nth-child(2) > span:nth-child(2)`).text();
            if (!school.includes('University of Connecticut')) {
                return;
            }

            rmp.push($(`li.listing:nth-child(${i + 1}) > a:nth-child(1)`)
                .attr('href')
                .split('tid=')[1]);
        });

        professors.push({
            name: prof,
            sections: teaching,
            rmpIds: rmp
        });
    }

    return {
        name, grading, credits,
        prereqs, lastDataMarker,
        description: desc,
        sections, professors
    }
}

/**
 * Attempts to retrieve information about
 * the given section of a course in the form
 * of a SectionData object.
 * 
 * @param identifier the course identifier
 * @param section the course section to query
 */
export const searchBySection = async (identifier: string, section: string): Promise<SectionPayload> => {
    let res = await searchCourse(identifier, detectCampusBySection(section) || 'any');
    if (!res) {
        return null;
    }

    let data = res
        .sections
        .find(({ section: sec }) => sec.toLowerCase() === section.toLowerCase());

    if (!data) {
        return null;
    }

    return {
        name: res.name,
        grading: res.grading,
        credits: res.credits,
        prereqs: res.prereqs,
        lastDataMarker: res.lastDataMarker,
        description: res.description,
        section: data
    }
}

export const searchRMP = async (instructor: string) => {
    let $ = await axios.get(`https://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=University+Of+Connecticut&query=${instructor.replace(' ', '+')}`)
        .then(res => res.data)
        .then(data => cheerio.load(data))
        .catch(err => {
            console.error(err);
            return null;
        });

    instructor = decodeEntity(replaceAll(instructor, '<br>', ' '));

    if (!$) {
        return {
            name: instructor,
            rmpIds: []
        }
    }

    let rmp: string[] = [];
    $('li.listing').each((i: number) => {
        let school = $(`li.listing:nth-child(${i + 1}) > a:nth-child(1) > span:nth-child(2) > span:nth-child(2)`).text();
        if (!school.includes('University of Connecticut')) {
            return;
        }

        rmp.push($(`li.listing:nth-child(${i + 1}) > a:nth-child(1)`)
            .attr('href')
            .split('tid=')[1]);
    });

    return {
        name: instructor,
        rmpIds: rmp
    }
}

/**
 * Attempts to guess what campus a certain
 * section is being taught at.
 * 
 * Notice: This method will not always work,
 * as off-campus courses and Storrs courses
 * both do not have alphabetic prefixes, and
 * just start with a the section number.
 * 
 * @param section the section name
 */
export const detectCampusBySection = (section: string): CampusType => {
    switch (section.substring(0, 1).toLowerCase()) {
        case 'h':
            return 'hartford';
        case 'z':
            return 'stamford';
        case 'w':
            return 'waterbury';
        case 'n':
            return 'avery_point';
        default:
            return 'storrs';
    }
}

export const getEmoteForEnrollmentState = (state: EnrollmentPayload) => {
    if (state.overfill && state.available !== state.total) return ':no_entry_sign:';
    if (state.overfill) return ':x:';
    if (state.percent > 0.9) return ':octagonal_sign:';
    return ':white_check_mark:';
}

/**
 * Attempts to query enrollment data from the
 * course catalog enrollment API.
 * 
 * Returns an unformatted string of #/# which
 * represents the current available seats and
 * capacity of the requested class.
 * 
 * @param term the term id of the current term
 * @param classNumber the class number for the requested class
 * @param section the requested section
 */
export const getRawEnrollment = async (term: string, classNumber: string, section: string): Promise<EnrollmentPayload> => await axios
    .post('https://catalog.uconn.edu/wp-content/plugins/uc-courses/soap.php', qs.stringify({
        action: 'get_latest_enrollment',
        term: term,
        classNbr: classNumber,
        sessionCode: 1,
        classSection: section
    }))
    .then(res => res.data)
    .then(async res => {
        if (!res.success) {
            throw new Error('Request failed');
        }

        let seats: string[] = res.data.split('/');
        let available = parseInt(seats[0]);
        let total = parseInt(seats[1]);
        let overfill = available >= total;

        return {
            course: {
                term,
                section,
                classNumber
            },
            available,
            total,
            overfill,
            percent: Number((available / total).toFixed(2))
        }
    })
    .catch(_ => null);