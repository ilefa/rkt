import axios from 'axios';
import moment from 'moment';
import cheerio from 'cheerio';
import tableparse from 'cheerio-tableparser';

import { Command, CommandReturn } from '../../command';
import { decode as decodeEntity } from 'html-entities';
import { PageContent } from '../../../../../util/paginator';
import { Message, Permissions, TextChannel, User } from 'discord.js';

import {
    bold,
    EmbedIconType,
    emboss,
    generateEmbed,
    generateSimpleEmbed,
    getCampusIndicator,
    getHighestDivisor,
    italic,
    link,
    PaginatedEmbed,
    replaceAll
} from '../../../../../util';

const identifierRegex = /^[a-zA-Z]{2,4}\d{4}(Q|E|W)*$/;

export default class CourseCommand extends Command {

    constructor() {
        super('course', `Invalid usage: ${emboss('.course <course> [campus]')}`, null, [
            {
                name: 'Args',
                value: `${bold('__course__')}: the course to retrieve data for\n` 
                     + `${bold('__campus__')}: the campus to search for`,
                inline: false
            },
            {
                name: 'Valid Course Specification',
                value: emboss('<course prefix><course number>[Q,E,W]'),
                inline: false
            },
            {
                name: 'Valid Campuses',
                value: emboss('any, storrs, hartford, stamford, waterbury, avery_point'),
                inline: false
            }
        ], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0 || args.length > 2) {
            return CommandReturn.HELP_MENU;
        }

        let identifier = args[0].toUpperCase();
        if (!identifierRegex.test(identifier)) {
            message.reply(generateEmbed('Course Search', EmbedIconType.UCONN, `Invalid or malformed course name: ${emboss(identifier)}`, [
                {
                    name: 'Valid Course Name',
                    value: emboss('<course prefix><course number>[Q,E,W]'),
                    inline: false
                },
                {
                    name: 'Examples',
                    value: emboss('CSE1729, MATH1132Q'),
                    inline: false
                }
            ]));

            return CommandReturn.EXIT;
        }

        let campus: CampusType = args[1] as CampusType || 'any';
        if (!campus) {
            message.reply(generateEmbed('Course Search', EmbedIconType.UCONN, `Invalid or malformed campus specification: ${emboss(args[1])}`, [
                {
                    name: 'Valid Campuses',
                    value: emboss(['any', 'storrs', 'hartford', 'stamford', 'waterbury', 'avery_point'].join(', ')),
                    inline: true
                }
            ]));

            return CommandReturn.EXIT;
        }
        
        this.startLoader(message);

        let prefix = identifier.split(/[0-9]/)[0].toUpperCase();
        let number = identifier.split(/[a-zA-Z]{2,4}/)[1];

        let target = `https://catalog.uconn.edu/directory-of-courses/course/${prefix}/${number}/`;
        let res = await axios
            .get(target)
            .then(res => res.data)
            .catch(res => {
                console.log(res);
                return null;
            });

        if (!res) {
            message.reply(generateSimpleEmbed('Course Search', EmbedIconType.UCONN, `Failed to lookup courses matching descriptor ${emboss(identifier)}.`));
            return CommandReturn.EXIT;
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
            message.reply(generateSimpleEmbed(`Course Search » ${identifier}`, EmbedIconType.UCONN,
                `${bold(name)}\n\n`
                + `:arrow_right: ${link('Course Catalog', target)}\n`
                + `:hash: Credits: ${bold(credits)}\n` 
                + `:asterisk: Grading Type: ${bold(grading)}\n\n`
                + `${bold('Description')}\n` 
                + `${italic(desc)}\n\n` 
                + `${bold('Prerequisites')}\n`
                + `${prereqs}\n\n`
                + `:warning: There are no sections of ${bold(identifier)} being taught this semester.`))
            return CommandReturn.EXIT;
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
        
        let profs: ProfessorData[] = [];
        sections = sections.slice(1, sections.length);

        for (let section of sections) {
            let prof = section.instructor;
            if (profs.some(p => p.name === prof)) {
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
                profs.push({
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

                rmp.push($(`li.listing:nth-child(${i + 1}) > a:nth-child(1)`).attr('href').split('tid=')[1]);
            });

            profs.push({
                name: prof,
                sections: teaching,
                rmpIds: rmp
            });
        }

        let divisor = getHighestDivisor(profs.length);
        let pages: PageContent[] = [];
        let tempPage: PageContent;
        let profList = '';

        // TODO: Broken for larger course offerings.
        if (profs.length <= 10) divisor = profs.length;
        if (divisor > 10) divisor = 10;

        let counter = 0;

        profs
            .sort((a, b) => a.name.length - b.name.length)
            .forEach((prof: ProfessorData, i) => {
                counter++;

                if (counter >= divisor && i !== 0) {
                    tempPage.fields[2].value = profList;
                    pages.push(tempPage);
                    counter = 0;
                    profList = '';
                    tempPage = null;
                }

                if (!tempPage) {
                    tempPage = {
                        description: `${bold(name)}\n\n`
                                    + `:arrow_right: ${link('Course Catalog', target)}\n`
                                    + `:hash: Credits: ${bold(credits)}\n` 
                                    + `:asterisk: Grading Type: ${bold(grading)}\n\n`
                                    + `${bold('Description')}\n` 
                                    + `${italic(desc)}\n\n`,
                        fields: [
                            {
                                name: 'Last Data Marker',
                                value: moment(lastDataMarker).format('MMMM Do YYYY, h:mm:ss a'),
                                inline: false
                            },
                            {
                                name: 'Prerequisites',
                                value: prereqs,
                                inline: false
                            },
                            {
                                name: 'Professors',
                                value: profList.trimEnd(),
                                inline: false
                            }
                        ]
                    }
                }

                let rmpList = '';
                prof
                    .rmpIds
                    .slice(0, Math.min(prof.rmpIds.length, 10))
                    .forEach((id, i) => rmpList += link(`[${i + 1}]`, `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${id}`));

                let campuses = [];
                prof.sections.forEach(section => {
                    if (!campuses.includes(section.campus)) {
                        campuses.push(section.campus);
                    }
                });

                let campusIndicator = '';
                campuses.forEach(campus => campusIndicator += getCampusIndicator(campus));
                
                let toAppend = ` • ${bold(`[${campusIndicator}]`)} ${prof.name}${rmpList.length !== 0 ? ` ${rmpList}` : ''}\n     ${prof.sections.map(data => data.section).join(', ')}\n`;
                
                // Happens in rare cases such as ENGR1166 wherein same sections and data repeated many times.
                if (profList.includes(toAppend)) {
                    return;
                }

                profList += toAppend;
            });

        PaginatedEmbed.of(message.channel as TextChannel,
            user, `Course Search » ${identifier}`,
            EmbedIconType.UCONN, pages, 600000);
                
        return CommandReturn.EXIT;
    }

}

type SectionData = {
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

type ProfessorData = {
    name: string;
    sections: SectionData[];
    rmpIds: string[];
}

type CampusType = 'any' 
                | 'storrs' 
                | 'hartford' 
                | 'stamford' 
                | 'waterbury' 
                | 'avery_point';