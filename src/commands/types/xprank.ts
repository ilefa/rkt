import axios from 'axios';

import { XpBoardUser } from '../../lib/xp';
import { Command, CommandReturn } from '../command';
import { Message, Permissions, User } from 'discord.js';
import {
    asMention,
    bold,
    emboss,
    generateSimpleEmbed,
    getDownwardXpDifference,
    getUpwardXpDifference,
    ordinalSuffix
} from '../../lib/util';

export default class XpRankCommand extends Command {

    constructor() {
        super('xprank', `Invalid usage: ${emboss('.xprank')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let res: XpBoardUser[] = await axios.get(`https://mee6.xyz/api/plugins/levels/leaderboard/${message.guild.id}`)
            .then(res => res.data)
            .then(data => data.players)
            .catch(() => null);

        if (!res) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, 'Something went wrong while retrieving data from the web.'));
            return CommandReturn.EXIT;
        }

        let target = res.find(u => u.id === user.id);
        if (!target) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, 'You are not on the experience leaderboard.'));
            return CommandReturn.EXIT;
        }

        let idx = res.indexOf(target);
        let position = idx + 1;
        let str = `${bold('Leaderboard Position')}` 
                + `\nYou are ${bold(ordinalSuffix(position))} on the leaderboard.` 
                + `\n\n${bold('Ranking Insights')}` 
                + `\n${position == 1 
                        ? ':first_place: You are at the top of the leaderboard.' 
                        : `:arrow_down: You are ${bold(getUpwardXpDifference(res, idx).toLocaleString() + ' XP')} behind ${asMention(res[idx - 1].id)}`}` 
                + `\n${position == res.length 
                        ? ':upside_down: You are at the bottom of the leaderboard.' 
                        : `:arrow_up: You are ${bold(getDownwardXpDifference(res, idx).toLocaleString() + ' XP')} ahead of ${asMention(res[idx + 1].id)}`}`;

        message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, str));
        return CommandReturn.EXIT;
    }

}