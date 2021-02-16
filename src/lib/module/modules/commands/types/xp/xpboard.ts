import { getLeaderboard } from '../../../xp/api';
import { collectEntries } from '../../../xp/tracker';
import { Message, Permissions, User } from 'discord.js';
import { genXpCompareChart } from '../../../../../chart';
import { XpBoardUser, XpComparePayload } from '../../../xp/struct';
import { Command, CommandCategory, CommandReturn } from '../../command';
import {
    asMention,
    bold,
    DAY_MILLIS,
    EmbedIconType,
    emboss,
    endLoader,
    generateSimpleEmbed,
    generateSimpleEmbedWithImageAndThumbnail,
    generateSimpleEmbedWithThumbnail,
    getEmoteForXpPlacement,
    MessageLoader,
    numberEnding,
    startLoader,
    sum
} from '../../../../../util';

export default class XpBoardCommand extends Command {

    constructor() {
        super('xpboard', CommandCategory.XP, `Invalid usage: ${emboss('.xpboard [-g]')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0 && args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }

        let loader: MessageLoader = await startLoader(message);
        let res: XpBoardUser[] = await getLeaderboard(message.guild.id);
        if (!res) {
            endLoader(loader);
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, EmbedIconType.XP, 'Something went wrong while retrieving data from the web.'));
            return CommandReturn.EXIT;
        }
        
        let str = '';
        let amt = res.length;
        let total = sum(res, record => record.xp);
        
        // get top 10, or list length - 1, whichever comes first
        res = res.slice(0, Math.min(10, res.length));
        let chart = null;
        if (args[0] && args[0].toLowerCase() === '-g') {
            let records: XpComparePayload[] = [];
            res.map(user => {
                records.push({
                    target: user.id,
                    data: collectEntries(user.id, DAY_MILLIS)
                });
            });
            
            chart = await genXpCompareChart(records, 'xp')
                .setWidth(1250)
                .setHeight(800)
                .setBackgroundColor('rgba(0, 0, 0, 0)')
                .getShortUrl();
        }

        res.map((user, i) => {
            str += `${getEmoteForXpPlacement(i + 1)} ${asMention(user.id)} with ${bold(user.xp.toLocaleString() + ' XP')} (${user.message_count.toLocaleString()} :incoming_envelope:)\n`;
        });

        endLoader(loader);

        if (chart) {
            message.reply(generateSimpleEmbedWithImageAndThumbnail(`${message.guild.name} - Experience Board`, EmbedIconType.XP, str, chart, message.guild.iconURL()));
            return CommandReturn.EXIT;
        }

        message.reply(generateSimpleEmbedWithThumbnail(`${message.guild.name} - Experience Board`, EmbedIconType.XP,
            `Tracking ${bold(total.toLocaleString() + ' XP')} between ${bold(`${amt.toLocaleString()} member${numberEnding(amt)}`)}.\n\n` + str, message.guild.iconURL()));
        return CommandReturn.EXIT;
    }

}