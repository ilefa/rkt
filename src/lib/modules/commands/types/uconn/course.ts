import moment from 'moment';

import { Message, Permissions, TextChannel, User } from 'discord.js';
import { CampusType, ProfessorData, searchCourse } from '../../../../util/uconn';
import { EmbedIconType, getCampusIndicator, MessageLoader } from '../../../../util';

import {
    bold,
    Command,
    CommandReturn,
    emboss,
    endLoader,
    getHighestDivisor,
    italic,
    link,
    PageContent,
    PaginatedEmbed,
    startLoader
} from '@ilefa/ivy';

const identifierRegex = /^[a-zA-Z]{2,4}\d{4}(Q|E|W)*$/;

export class CourseCommand extends Command {

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
        ], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0 || args.length > 2) {
            return CommandReturn.HELP_MENU;
        }

        let identifier = args[0].toUpperCase();
        if (!identifierRegex.test(identifier)) {
            message.reply(this.manager.engine.embeds.build('Course Search', EmbedIconType.UCONN, `Invalid or malformed course name: ${emboss(identifier)}`, [
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
            ], message));

            return CommandReturn.EXIT;
        }

        let campus: CampusType = args[1] as CampusType || 'any';
        if (!campus) {
            message.reply(this.manager.engine.embeds.build('Course Search', EmbedIconType.UCONN, `Invalid or malformed campus specification: ${emboss(args[1])}`, [
                {
                    name: 'Valid Campuses',
                    value: emboss(['any', 'storrs', 'hartford', 'stamford', 'waterbury', 'avery_point'].join(', ')),
                    inline: true
                }
            ], message));

            return CommandReturn.EXIT;
        }
        
        let prefix = identifier.split(/[0-9]/)[0].toUpperCase();
        let number = identifier.split(/[a-zA-Z]{2,4}/)[1];
        let loader: MessageLoader = await startLoader(message);
        let res = await searchCourse(identifier, campus);
        if (!res) {
            message.reply(this.manager.engine.embeds.build('Course Search', EmbedIconType.UCONN, `Error locating course ${emboss(args[0])} on campus ${emboss(args[1])}.`, null, message));
            endLoader(loader);
            return CommandReturn.EXIT;
        }

        let {
            name,
            description,
            prereqs,
            credits,
            grading,
            lastDataMarker,
            professors,
            sections
        } = res;

        let target = `https://catalog.uconn.edu/directory-of-courses/course/${prefix}/${number}/`;

        if (!sections.length || !professors.length) {
            endLoader(loader);
            message.reply(this.manager.engine.embeds.build('', EmbedIconType.UCONN, `${bold(name)}\n\n`
                + `:arrow_right: ${link('Course Catalog', target)}\n`
                + `:hash: Credits: ${bold(credits)}\n` 
                + `:asterisk: Grading Type: ${bold(grading)}\n\n`
                + `${bold('Description')}\n` 
                + `${italic(description)}\n\n`, [
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
                        name: 'Sections',
                        value: ':warning: No sections are being taught this semester.',
                        inline: false
                    }
                ], message));

            return CommandReturn.EXIT;
        }

        let divisor = getHighestDivisor(professors.length);
        let pages: PageContent[] = [];
        let tempPage: PageContent;
        let profList = '';

        // TODO: Broken for larger course offerings.
        if (professors.length <= 10) divisor = professors.length;
        if (divisor > 10) divisor = 10;

        let counter = 0;

        professors
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
                                    + `${italic(description)}\n\n`,
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
                                name: 'Sections',
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

        endLoader(loader);

        if (pages.length === 0) {
            message.reply(this.manager.engine.embeds.build(`Course Search » ${identifier}`, EmbedIconType.UCONN, 'An error occurred while retrieving data from the web.', null, message));
            return CommandReturn.EXIT;
        }

        PaginatedEmbed.of(this.manager.engine,
            message.channel as TextChannel,
            user, `Course Search » ${identifier}`,
            EmbedIconType.UCONN, pages, 600000);
                
        return CommandReturn.EXIT;
    }

}