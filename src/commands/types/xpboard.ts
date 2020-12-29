import axios from 'axios';

import { XpBoardUser } from '../../lib/xp';
import { Command, CommandReturn } from '../command';
import { Message, Permissions, User } from 'discord.js';
import {
    asMention,
    bold,
    emboss,
    generateSimpleEmbed,
    generateSimpleEmbedWithImage,
    getEmoteForXpPlacement
} from '../../lib/util';

export default class XpBoardCommand extends Command {

    constructor() {
        super('xpboard', `Invalid usage: ${emboss('.xpboard')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
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

        let str = '';
        res = res.slice(0, 9);
        res.map((user, i) => {
            str += `${getEmoteForXpPlacement(i + 1)} ${asMention(user.id)} with ${bold(user.xp.toLocaleString() + ' XP')} (${user.message_count.toLocaleString()} :incoming_envelope:)\n`;
        })

        message.reply(generateSimpleEmbedWithImage(`${message.guild.name} - Experience Board`, str, message.guild.iconURL()));
        return CommandReturn.EXIT;
    }

}