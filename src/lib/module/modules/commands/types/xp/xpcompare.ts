import moment from 'moment';

import { Command, CommandReturn } from '../../command';
import { Message, Permissions, User } from 'discord.js';
import { genXpCompareChart } from '../../../../../chart';
import { collectEntries, getNameForType } from '../../../xp/tracker';
import { TrackingType, XpComparePayload } from '../../../xp/struct';
import {
    asMention,
    bold,
    COMPARISON_LEGEND,
    DAY_MILLIS,
    EmbedIconType,
    emboss,
    generateEmbed,
    generateSimpleEmbed,
    generateSimpleEmbedWithThumbnail,
    SNOWFLAKE_REGEX,
    USER_MENTION_REGEX
} from '../../../../../util';

export default class XpCompareCommand extends Command {

    constructor() {
        super('xpboard', `Invalid usage: ${emboss('.xpcompare <type> <...members>')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length < 3) {
            return CommandReturn.HELP_MENU;
        }

        if (args.length > 7 || message.mentions.members.size > 7) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Analysis`, EmbedIconType.XP, 'Cannot compare more than 6 members at once.'));
            return CommandReturn.EXIT;
        }

        if (!['xp', 'messages', 'position'].includes(args[0].toLowerCase())) {
            message.reply(generateEmbed(`${message.guild.name} - Experience Analysis`, EmbedIconType.XP, `Invalid type parameter: ${emboss(args[1] ? args[1] : '[missing]')}.`, [
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
            if (SNOWFLAKE_REGEX.test(client)) {
                target = await message.client.users.fetch(client);
            }

            if (USER_MENTION_REGEX.test(client)) {
                let id = client.slice(3, client.length - 1);
                target = await message.client.users.fetch(id);
            }

            if (!target) {
                message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Analysis`, EmbedIconType.XP, `Invalid or unknown target: ${emboss(client)}`));
                return CommandReturn.EXIT;
            }

            if (records.some(payload => payload.target === target.id)) {
                message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Analysis`, EmbedIconType.XP, `Duplicate target: ${emboss(client)}`));
                return CommandReturn.EXIT;
            }

            if (target.bot) {
                message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Analysis`, EmbedIconType.XP, `Cannot use bot as a target: ${emboss(client)}`));
                return CommandReturn.EXIT;
            }

            let data = collectEntries(target.id, DAY_MILLIS);
            if (!data || Object.keys(data[0]).length === 0) {
                message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Analysis`, EmbedIconType.XP, `${asMention(target.id)} has no available data.`));
                return CommandReturn.EXIT;
            }

            records.push({
                target: target.id, data
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

        message.reply(generateSimpleEmbedWithThumbnail(`${message.guild.name} - Experience Tracking`, EmbedIconType.XP,
            `Comparing ${bold(records.length + ' users')} ${getNameForType(type)} progression for the last ${bold('1d')}.\n\n`
            + `**Latest Data Marker**\n`
            + `${moment(records[0].data[records[0].data.length - 1].time).format('MMMM Do YYYY, h:mm:ss a')}\n\n`
            + `**Legend**\n` 
            + legend.trimEnd(), chart));
        return CommandReturn.EXIT;
    }

}