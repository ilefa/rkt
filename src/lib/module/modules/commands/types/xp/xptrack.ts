import moment from 'moment';

import { genXpChart } from '../../../../../chart';
import { Command, CommandReturn } from '../../command';
import { Message, Permissions, User } from 'discord.js';
import { TrackingType, XpRecord } from '../../../xp/struct';
import { collectEntries, getNameForType } from '../../../xp/tracker';
import {
    asMention,
    bold,
    DAY_MILLIS,
    EmbedIconType,
    emboss,
    generateEmbed,
    generateSimpleEmbed,
    generateSimpleEmbedWithImage,
    getChangeString,
    getDurationWithUnit,
    getEmoteForIndicator,
    getLatestTimeValue,
    SNOWFLAKE_REGEX,
} from '../../../../../util';

export default class XpTrackCommand extends Command {

    constructor() {
        super('xptrack', `Invalid usage: ${emboss('.xptrack <target> <type> [range]')}`, null, [
            {
                name: 'Args',
                value: `${bold('__target__')}: a mentioned member or a member's snowflake id\n` 
                     + `${bold('__type__')}: the tracking type of the results to fetch\n` 
                     + `${bold('__range__')}: the relevent time period for these results`,
                inline: false
            },
            {
                name: 'Valid Types',
                value: emboss('xp, messages, position'),
                inline: false
            },
            {
                name: 'Valid Range Specification',
                value: emboss('[#](s|m|d|h|mo|y)'),
                inline: false
            }
        ], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            return CommandReturn.HELP_MENU;
        }

        if (!args[0].match(SNOWFLAKE_REGEX) && message.mentions.members.size != 1) {
            message.reply(generateEmbed(`${message.guild.name} - Experience Tracking`, EmbedIconType.XP, `Missing target parameter.`, [
                {
                    name: 'Valid Target',
                    value: `Please ${emboss('@mention')} or provide a ${emboss('#<snowflakeId>')} for exactly one member.`,
                    inline: true
                }
            ]));

            return CommandReturn.EXIT;
        }

        if (!args[1] || !['xp', 'messages', 'position'].includes(args[1].toLowerCase())) {
            message.reply(generateEmbed(`${message.guild.name} - Experience Tracking`, EmbedIconType.XP, `Invalid type parameter: ${emboss(args[1] ? args[1] : '[missing]')}.`, [
                {
                    name: 'Valid Types',
                    value: emboss('xp, messages, position'),
                    inline: true
                }
            ]));

            return CommandReturn.EXIT;
        }

        let type = args[1] as TrackingType;
        let target = args[0].match(SNOWFLAKE_REGEX)
            ? await message.client.users.fetch(args[0]) 
            : message.mentions.members.first();

        if (!target) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Tracking`, EmbedIconType.XP, `Invalid or unknown target: ${emboss(args[0])}.`));
            return CommandReturn.EXIT;
        }

        let range = DAY_MILLIS;
        if (args[2]) {
            let customRange = getDurationWithUnit(args[1], 'millisecond');
            if (!customRange) {
                message.reply(generateEmbed(`${message.guild.name} - Experience Tracking`, EmbedIconType.XP, `Invalid time specification: ${emboss(args[2])}.`, [
                    {
                        name: 'Valid Time Specification',
                        value: emboss(`[#](s|m|d|h|mo|y)`),
                        inline: true
                    }
                ]))
                return CommandReturn.EXIT;
            }

            range = customRange;
        }

        this.startLoader(message);

        let entries: XpRecord[] = collectEntries(target.id, range);
        if (!entries) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Tracking`, EmbedIconType.XP, `Failed to find historical data for ${asMention(target.id)}.`))
            return CommandReturn.EXIT;
        }
        
        entries = entries.sort((a, b) => {
            return new Date(b.time).getTime() - new Date(a.time).getTime();
        });

        let chart = await genXpChart(entries, type)
            .setWidth(1250)
            .setHeight(800)
            .setBackgroundColor('rgba(0, 0, 0, 0)')
            .getShortUrl();

        let initial = entries[0][0];
        let latest = entries[entries.length - 1][0];

        if (!initial || !latest) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Tracking`, EmbedIconType.XP, `Failed to find historical data for ${asMention(target.id)}.`))
            return CommandReturn.EXIT;
        }

        let xpVariance = latest.experience - initial.experience;
        let msgVariance = latest.messages - initial.messages;
        let posVariance = latest.position - initial.position;

        message.reply(generateSimpleEmbedWithImage(`${message.guild.name} - Experience Tracking`, EmbedIconType.XP,
            `Tracking ${asMention(target.id)}'s ${getNameForType(type)} progression for the last ${bold(getLatestTimeValue(range))}.\n\n`
            + `**Indicators**\n` 
            + `${getEmoteForIndicator(xpVariance, 0, 0, 0)} Experience Change: ${bold('+' + xpVariance + ' XP')}\n`
            + `${getEmoteForIndicator(msgVariance, 0, 0, 0)} Messages Change: ${bold('+' + msgVariance + ' :incoming_envelope:')}\n`
            + `${getEmoteForIndicator(posVariance, 0, 0, 0)} Position Change: ${bold(posVariance === 0 ? 'None' : getChangeString(posVariance, '', 1, true))}\n\n`
            + `**Latest Data Marker**\n`
            + `${moment(latest.time).format('MMMM Do YYYY, h:mm:ss a')}`, chart));
        return CommandReturn.EXIT;
    }

}