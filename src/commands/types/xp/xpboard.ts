import { XpBoardUser, XpComparePayload } from '../../../lib/xp/struct';
import { getLeaderboard } from '../../../lib/xp/api';
import { Command, CommandReturn } from '../../command';
import { Message, MessageEmbed, Permissions, User } from 'discord.js';
import {
    asMention,
    bold,
    DAY_MILLIS,
    emboss,
    generateSimpleEmbed,
    generateSimpleEmbedWithImage,
    getEmoteForXpPlacement
} from '../../../lib/util';
import { collectEntries } from '../../../lib/xp/tracker';
import { genXpCompareChart } from '../../../lib/chart';

export default class XpBoardCommand extends Command {

    constructor() {
        super('xpboard', `Invalid usage: ${emboss('.xpboard [-g]')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0 && args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }

        let res: XpBoardUser[] = await getLeaderboard(message.guild.id);
        if (!res) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, 'Something went wrong while retrieving data from the web.'));
            return CommandReturn.EXIT;
        }

        
        let str = '';
        
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

        let embed = new MessageEmbed()
            .setTitle(`${message.guild.name} - Experience Board`)
            .setImage(chart)
            .setThumbnail(message.guild.iconURL())
            .setColor(0x27AE60)
            .setDescription(str)

        message.reply(embed);
        return CommandReturn.EXIT;
    }

}