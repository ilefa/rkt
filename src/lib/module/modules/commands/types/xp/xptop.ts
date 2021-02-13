import moment from 'moment';

import { getTopMovers } from '../../../xp/tracker';
import { Message, Permissions, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../../command';

import {
    asMention,
    bold,
    DAY_MILLIS,
    EmbedIconType,
    emboss,
    generateEmbed,
    generateSimpleEmbed,
    generateSimpleEmbedWithThumbnail,
    getDurationWithUnit,
    getEmoteForXpPlacement,
    getLatestTimeValue
} from '../../../../../util';

export default class XpTopCommand extends Command {

    constructor() {
        super('xpboard', CommandCategory.XP, `Invalid usage: ${emboss('.xptop [<range> <limit>]')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0
                && args.length !== 1
                && args.length !== 2) {
            return CommandReturn.HELP_MENU;
        }

        let range = DAY_MILLIS;
        if (args[0]) {
            let customRange = getDurationWithUnit(args[0], 'millisecond');
            if (!customRange) {
                message.reply(generateEmbed(`${message.guild.name} - Experience Top Movers`, EmbedIconType.XP, `Invalid time specification: ${emboss(args[0])}.`, [
                    {
                        name: 'Valid Time Specification',
                        value: emboss(`[#](m|d|h|mo|y)`),
                        inline: true
                    }
                ]));
                return CommandReturn.EXIT;
            }

            range = customRange;
        }

        let limit = 10;
        if (args[1]) {
            let customLimit = parseInt(args[1]);
            if (isNaN(customLimit) || customLimit <= 0) {
                message.reply(generateEmbed(`${message.guild.name} - Experience Top Movers`, EmbedIconType.XP, `Invalid or Non-Numeric Limit: ${emboss(args[1])}.`, [
                    {
                        name: 'Reason',
                        value: 'Limit must be a non-zero positive integer.',
                        inline: true
                    }
                ]));
                return CommandReturn.EXIT;
            }
        }

        this.startLoader(message);

        let res = await getTopMovers(message.guild.id, limit, range);
        if (!res) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Top Movers`, EmbedIconType.XP, `Something went wrong while retrieving historical data.`));
            return CommandReturn.EXIT;
        }

        let str = `In the past ${bold(getLatestTimeValue(range))}, the following users have been the most active.\n\n` 
                + `**Last Data Marker**\n` 
                + `${moment(res[0].marker).format('MMMM Do YYYY, h:mm:ss a')}\n\n` 
                + `**Top ${limit} Movers**\n`;
                
        res.map((user, i) => {
            str += `${getEmoteForXpPlacement(i + 1)} ${asMention(user.client)} with ${bold('+' + user.exp + ' XP')} and ${bold('+' + user.messages.toLocaleString())} :incoming_envelope:\n`;
        })

        message.reply(generateSimpleEmbedWithThumbnail(`${message.guild.name} - Experience Top Movers`, EmbedIconType.XP, str, message.guild.iconURL()));
        return CommandReturn.EXIT;
    }

}