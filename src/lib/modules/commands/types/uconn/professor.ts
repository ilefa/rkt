import { Message, Permissions, User } from 'discord.js';
import { getRmpReport, RateMyProfessorReport, searchRMP } from '@ilefa/husky';
import { addTrailingDecimal, EmbedIconType, RMP_TAG_CONS, RMP_TAG_PROS } from '../../../../util';

import {
    bold,
    Command,
    CommandReturn,
    emboss,
    link,
    numberEnding,
    sum,
    capitalizeFirst,
} from '@ilefa/ivy';

type RmpResponse = RateMyProfessorReport & {
    mostRelevent: string;
}

enum RmpTag {
    PRO = '<:green:848364257434927125>',
    CON = '<:red:848364257569407066>',
    UNKNOWN = '<:gray:848364257644773416>'
}

enum RmpTagOrdinal {
    PRO, CON, UNKNOWN
}

const proOrCon = (tag: string) => {
    if (RMP_TAG_PROS.includes(tag.toLowerCase()))
        return RmpTag.PRO;

    if (RMP_TAG_CONS.includes(tag.toLowerCase()))
        return RmpTag.CON;

    return RmpTag.UNKNOWN;
}

const proOrConSorting = (tag: string) => {
    if (RMP_TAG_PROS.includes(tag.toLowerCase()))
        return RmpTagOrdinal.PRO;

    if (RMP_TAG_CONS.includes(tag.toLowerCase()))
        return RmpTagOrdinal.CON;

    return RmpTagOrdinal.UNKNOWN;
}

export class ProfessorCommand extends Command {
    
    constructor() {
        super('prof', `Invalid usage: ${emboss('.prof <name..>')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }
    
    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            return CommandReturn.HELP_MENU;
        }

        let name = args.join(' ');
        if (!name) return CommandReturn.HELP_MENU;

        let prof = await searchRMP(name);
        if (!prof.rmpIds.length) {
            message.reply(this.embeds.build('Professors', EmbedIconType.UCONN, `We couldn't locate any professors named ${emboss(name)}.`, [], message));
            return CommandReturn.EXIT;
        }

        let data: RmpResponse = null;
        if (prof.rmpIds.length > 1) {
            let results = await Promise.all(prof.rmpIds.map(id => getRmpReport(id)));
            let modified = results
                .map((ent, i) => ({
                    ...ent,
                    id: prof.rmpIds[i]
                }))
                .filter(ent => !!ent)
                .filter(ent => !isNaN(ent.ratings));

            // TODO: weight the ratings/take again/difficulty based on total ratings of that entry
            // TODO: this is because if one person rates the prof at 5/5, and another entry has
            // TODO: 44 ratings at 1/5, it will definitely skew the results from the real value
            // TODO: and be misinforming on the professors section of the course inspection page
            
            let mostRelevent = modified.sort((a, b) => b.ratings - a.ratings)[0].id;
            let averageRating = sum(modified, result => result.average) / modified.length;
            let averageTakeAgain = sum(modified, result => result.takeAgain) / modified.length;
            let averageDifficulty = sum(modified, result => result.difficulty) / modified.length;
            let totalRatings = sum(modified, result => result.ratings);
            let tags = ([] as string[]).concat.apply([], modified.map(result => result.tags)) as string[];

            data = {
                name: modified[0].name,
                average: averageRating,
                ratings: totalRatings,
                takeAgain: averageTakeAgain,
                difficulty: averageDifficulty,
                tags: [...new Set(tags.map(tag => capitalizeFirst(tag.toLowerCase())))],
                mostRelevent,
            }
        } else {
            let temp = await getRmpReport(prof.rmpIds[0]);
            data = { ...temp, mostRelevent: prof.rmpIds[0] };
        }

        message.reply(this.embeds.build(data.name, EmbedIconType.UCONN, `${bold(data.name)} was scored ${bold(`${addTrailingDecimal(data.average)}/5.0`)} based on ${bold(data.ratings)} rating${numberEnding(data.ratings)}.\n` 
            + `Difficulty Score: ${bold(addTrailingDecimal(data.difficulty) + '/5.0')}\n` 
            + `Would Retake: ${bold(data.takeAgain + '%')}\n\n` 
            + `${link(':link: View ratings on RateMyProfessors', `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${data.mostRelevent}`)}\n\n` 
            + `${bold('Student-Assigned Tags')}\n` 
            + data
                .tags
                .filter((val, i, self) => self.indexOf(val) === i)
                .sort((a, b) => proOrConSorting(a) - proOrConSorting(b))
                .map(tag => `${proOrCon(tag)} ${this.splitAndcapitalize(tag)}`)
                .join('\n'), [], message));

        return CommandReturn.EXIT;
    }
    
    private splitAndcapitalize = (str: string) => str.split(' ').map(capitalizeFirst).join(' ');

}