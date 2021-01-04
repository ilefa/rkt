import axios from 'axios';
import cheerio from 'cheerio';
import tableparse from 'cheerio-tableparser';

import { Command, CommandReturn } from '../command';
import { decode as decodeEntity } from 'html-entities';
import { Message, Permissions, User } from 'discord.js';
import {
    bold,
    emboss,
    generateEmbed,
    generateSimpleEmbed,
    italic,
    link
} from '../../../../util';

const identifierRegex = /^[a-zA-Z]{2,4}\d{4}(Q|E|W)*$/;

export default class CourseSearchCommand extends Command {

    constructor() {
        super('csearch', `Invalid usage: ${emboss('.csearch <course> [campus]')}`, null, [
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
            message.reply(generateEmbed('Course Search', `Invalid or malformed course name: ${emboss(identifier)}`, [
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
            message.reply(generateEmbed('Course Search', `Invalid or malformed campus specification: ${emboss(args[1])}`, [
                {
                    name: 'Valid Campuses',
                    value: emboss(['any', 'storrs', 'hartford', 'stamford', 'waterbury', 'avery_point'].join(', ')),
                    inline: true
                }
            ]));

            return CommandReturn.EXIT;
        }

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
            message.reply(generateSimpleEmbed('Course Search', `Failed to lookup courses matching descriptor ${emboss(identifier)}.`));
            return CommandReturn.EXIT;
        }

        let loading = await message.reply('<a:loading:788890776444207194> Working on that..');
        let $ = cheerio.load(res);
        tableparse($);

        let name = $('.single-course > h3:nth-child(2)')
            .text()
            .split(/\d{4}(?:Q|E|W)\.\s/)[1];
            
        let grading = $('.grading-basis')
            .text()
            .trim()
            .split('Grading Basis: ')[1] || 'Graded';

        let credits = $('.credits')
            .text()
            .trim()
            .split(' ')[0];

        let prereqs = $('.prerequisites')
            .text()
            .trim()
            .split('Prerequisites: ')[1]
            .split('Prerequisite: ')[1]
            .split('Recommended Preparation')[0] || 'There are no prerequisites for this course.';

        let desc = $('.description').text() || 'There is no description provided for this course.';
        let sections: SectionData[] = [];

        let data: string[][] = ($('.tablesorter') as any).parsetable();
        if (!data[0]) {
            loading.delete();
            message.reply(generateSimpleEmbed(`Course Search » ${identifier}`,
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
            if (location.includes('classrooms.uconn.edu')) {
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
        let profList = '';
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
                .map(section => section.section)
                .sort();

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

        profs.sort((a, b) => a.name.length - b.name.length).forEach((prof: ProfessorData, i: number) => {
            if (profList.endsWith('...*') || profList.endsWith('more*')) {
                return;
            }

            let rmpList = '';
            prof
                .rmpIds
                .slice(0, Math.min(prof.rmpIds.length, 10))
                .forEach((id, i) => rmpList += link(`[${i + 1}]`, `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${id}`));

            let toAppend = ` • ${prof.name}${rmpList.length !== 0 ? ` ${rmpList}` : ''}\n     ${prof.sections.join(', ')}\n`;
            let diff = 1024 - (profList.length + toAppend.length);
            if (diff < 0) {
                let andMore = italic(`+ ${profs.length - (i + 1)} more`);
                if (diff < andMore.length) {
                    andMore = italic('...');
                }

                diff = 1024 - (profList.length + toAppend.length);
                if (diff < 0) {
                    return;
                }
            }

            profList += toAppend;
        });

        loading.delete();
        message.reply(generateEmbed(`Course Search » ${identifier}`,
            `${bold(name)}\n\n`
            + `:arrow_right: ${link('Course Catalog', target)}\n`
            + `:hash: Credits: ${bold(credits)}\n` 
            + `:asterisk: Grading Type: ${bold(grading)}\n\n`
            + `${bold('Description')}\n` 
            + `${italic(desc)}\n\n`,
            // + `There are ${bold(sectionCount + ` section${numberEnding(sectionCount)}`)} being offered this semester${campus !== 'any' ? ` at ${bold(capitalizeFirst(campus.replace('_', ' ')))}` : ''}.\n\n
            [
                {
                    name: 'Prerequisites',
                    value: prereqs + '\n',
                    inline: false
                },
                {
                    name: 'Professors',
                    value: profList.trimEnd(),
                    inline: false
                }
            ]));
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
    sections: string[];
    rmpIds: string[];
}

type CampusType = 'any' 
                | 'storrs' 
                | 'hartford' 
                | 'stamford' 
                | 'waterbury' 
                | 'avery_point';