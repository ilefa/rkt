import moment from 'moment';

import { genXpCompareChart } from '../../../lib/chart';
import { Command, CommandReturn } from '../../command';
import { collectEntries, getNameForType } from '../../../lib/xp/tracker';
import { TrackingType, XpComparePayload } from '../../../lib/xp/struct';
import { Message, MessageEmbed, Permissions, User } from 'discord.js';
import {
    asMention,
    bold,
    COMPARISON_LEGEND,
    DAY_MILLIS,
    emboss,
    generateEmbed,
    generateSimpleEmbed
} from '../../../lib/util';

const snowflakeRegex = /^\d{18,}$/;
const mentionedRegex = /^<@\!\d{18,}>$/;

export default class XpCompareCommand extends Command {

    constructor() {
        super('xpboard', `Invalid usage: ${emboss('.xpcompare <type> <...members>')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length < 3) {
            return CommandReturn.HELP_MENU;
        }

        if (args.length > 7 || message.mentions.members.size > 7) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Analysis`, 'Cannot compare more than 6 members at once.'));
            return CommandReturn.EXIT;
        }

        if (!['xp', 'messages', 'position'].includes(args[0].toLowerCase())) {
            message.reply(generateEmbed(`${message.guild.name} - Experience Analysis`, `Invalid type parameter: ${emboss(args[1] ? args[1] : '[missing]')}.`, [
                {
                    name: 'Valid Types',
                    value: emboss('xp, messages, position'),
                    inline: true
                }
            ]));

            return CommandReturn.EXIT;
        }

        let type = args[0] as TrackingType;
        let records = [] as XpComparePayload[];
        for (let client of args.slice(1)) {
            let target: User = null;
            if (snowflakeRegex.test(client)) {
                target = await message.client.users.fetch(client);
            }

            if (mentionedRegex.test(client)) {
                let id = client.slice(3, client.length - 1);
                target = await message.client.users.fetch(id);
            }

            if (!target) {
                message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Analysis`, `Invalid or unknown target: ${emboss(client)}`));
                return CommandReturn.EXIT;
            }

            if (records.some(payload => payload.target === target.id)) {
                message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Analysis`, `Duplicate target: ${emboss(client)}`));
                return CommandReturn.EXIT;
            }

            if (target.bot) {
                message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Analysis`, `Cannot use bot as a target: ${emboss(client)}`));
                return CommandReturn.EXIT;
            }

            records.push({
                target: target.id,
                data: collectEntries(target.id, DAY_MILLIS)
            });

        }

        let legend = '';
        records.map((target, i) => {
            legend += COMPARISON_LEGEND[i] + ` ${asMention(target.target)}\n`;
        })

        let chart = await genXpCompareChart(records, type)
            .setWidth(1250)
            .setHeight(800)
            .setBackgroundColor('rgba(0, 0, 0, 0)')
            .getShortUrl();

        let embed = new MessageEmbed()
            .setTitle(`${message.guild.name} - Experience Tracking`)
            .setImage(chart)
            .setColor(0x27AE60)
            .setDescription(`Comparing ${bold(records.length + ' users')} ${getNameForType(type)} progression for the last ${bold('1d')}.\n\n`
                + `**Latest Data Marker**\n`
                + `${moment(records[0].data[records[0].data.length - 1].time).format('MMMM Do YYYY, h:mm:ss a')}\n\n`
                + `**Legend**\n` 
                + legend.trimEnd());

        message.reply(embed);
        return CommandReturn.EXIT;
    }

}