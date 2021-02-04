import { Message, Permissions, User } from 'discord.js';
import { Command, CommandReturn } from '../../command';

import {
    COURSE_IDENTIFIER,
    getEmoteForEnrollmentState,
    getRawEnrollment,
    searchBySection,
    searchRMP,
    SECTION_IDENTIFIER
} from '../../../../../util/uconn';

import {
    bold,
    EmbedIconType,
    emboss,
    generateEmbed,
    generateSimpleEmbed,
    italic,
    link,
    numberEnding
} from '../../../../../util';

export default class SectionCommand extends Command {

    constructor() {
        super('section', `Invalid usage: ${emboss('.section <course> <name>')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 2) {
            return CommandReturn.HELP_MENU;
        }

        let course = args[0];
        if (!COURSE_IDENTIFIER.test(course)) {
            message.reply(generateEmbed('Course Search', EmbedIconType.UCONN, `Invalid or malformed course name: ${emboss(course)}`, [
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

        let section = args[1];
        if (!SECTION_IDENTIFIER.test(section)) {
            message.reply(generateEmbed('Course Search', EmbedIconType.UCONN, `Invalid or malformed section: ${emboss(section)}`, [
                {
                    name: 'Valid Section Name',
                    value: emboss('[H,Z,W,N]<section number>[L,D]'),
                    inline: false
                },
                {
                    name: 'Examples',
                    value: emboss('H04L, 009D'),
                    inline: false
                }
            ]));
            return CommandReturn.EXIT;
        }

        this.startLoader(message);

        let data = await searchBySection(course, section);
        if (!data) {
            message.reply(generateSimpleEmbed('Course Search', EmbedIconType.UCONN,
                `Error locating section ${emboss(section)} for course ${emboss(course)}.`));
            return CommandReturn.EXIT;
        }

        let payload = data.section;
        let prefix = course.split(/[0-9]/)[0].toUpperCase();
        let number = course.split(/[a-zA-Z]{2,4}/)[1];
        let target = `https://catalog.uconn.edu/directory-of-courses/course/${prefix}/${number}/`;
        
        let {
            name,
            credits,
            grading,
            prereqs,
            description,
            section: res
        } = data;

        let { current, max } = payload.enrollment;
        let { termCode, classNumber, classSection } = payload.internal;
        
        let enrollment = await getRawEnrollment(termCode, classNumber, classSection);

        // If fails, fallback to data provided by the course catalog.
        if (!enrollment) {
            enrollment = {
                course: {
                    term: termCode,
                    section: classSection,
                    classNumber
                },
                available: current,
                total: max,
                overfill: current >= max,
                percent: Number((current / max).toFixed(2))
            }
        }

        let rmp = await searchRMP(res.instructor);
        let rmpLinks = '';
        if (rmp) {
            rmp.rmpIds.forEach((id, i) => rmpLinks += link(`[${i + 1}]`, `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${id}`));
        }

        let location = res.location.name;
        if (location === 'No Room Required - Online') {
            location = 'meets virtually';
        } else {
            location = `is taught in ${link(location, res.location.url)}`
        }

        if (res.schedule && res.schedule.length) {
           location += ' ' + res.schedule;
        } else {
            location = 'does not meet'
        }

        message.reply(generateEmbed('Course Search', EmbedIconType.UCONN, `${bold(`${name} - Section ${res.section}`)}\n\n`
            + `:arrow_right: ${link('Course Catalog', target)}\n`
            + `:hash: Credits: ${bold(credits)}\n` 
            + `:asterisk: Grading Type: ${bold(grading)}\n\n`
            + `${bold('Description')}\n` 
            + `${italic(description)}\n\n`, [
                {
                    name: 'Prerequisites',
                    value: prereqs,
                    inline: false
                },
                {
                    name: `Section Information`,
                    value: `${bold(`Section ${section}`)} is taught by ${bold(res.instructor)}${rmpLinks}.\n\n`
                         + `This section ${location}.\n` 
                         + `${getEmoteForEnrollmentState(enrollment)} This section ${!enrollment.overfill ? '' : 'is '}currently ${!enrollment.overfill ? 'has' : ''} ${enrollment.overfill 
                                ? (enrollment.available === enrollment.total 
                                        ? 'full' 
                                        : 'overfilled') 
                                    : `${enrollment.total - enrollment.available} seat${numberEnding(enrollment.total - enrollment.available)}`} available. ` 
                         + `${emboss(`(${enrollment.available}/${enrollment.total})`)}\n` 
                         + (res.notes.length 
                                ? `\n${bold('Additional Notes')}\n` 
                                + `${res.notes}` : ''),
                    inline: false
                }
            ]));

        return CommandReturn.EXIT;
    }

}