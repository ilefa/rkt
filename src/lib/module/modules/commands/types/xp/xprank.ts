import { XpBoardUser } from '../../../xp/struct';
import { getLeaderboard } from '../../../xp/api';
import { Message, Permissions, User } from 'discord.js';
import { getTopMovers, getTotalXp, nextLevelData } from '../../../xp/tracker';
import { Command, CommandCategory, CommandReturn } from '../../command';
import {
    asMention,
    bold,
    DAY_MILLIS,
    EmbedIconType,
    emboss,
    endLoader,
    findUser,
    generateSimpleEmbed,
    getDownwardXpDifference,
    getUpwardXpDifference,
    MessageLoader,
    ordinalSuffix,
    startLoader
} from '../../../../../util';

export default class XpRankCommand extends Command {

    constructor() {
        super('xprank', CommandCategory.XP, `Invalid usage: ${emboss('.xprank [target]')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 1) {
            return CommandReturn.HELP_MENU;
        }

        if (message.mentions.members.size > 1) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, EmbedIconType.XP, `Excess targets: ${emboss(args.join(' '))}`));
            return CommandReturn.EXIT;
        }

        let loader: MessageLoader = await startLoader(message);
        let res: XpBoardUser[] = await getLeaderboard(message.guild.id);
        if (!res) {
            endLoader(loader);
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, EmbedIconType.XP, 'Something went wrong while retrieving data from the web.'));
            return CommandReturn.EXIT;
        }

        let target: User = await findUser(message, args[0], user);
        if (!target) {
            endLoader(loader);
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, EmbedIconType.XP, `Invalid or unknown target: ${emboss(args[0] || '[missing]')}`));
            return CommandReturn.EXIT;
        }

        let id = target.id;
        let record = res.find(r => r.id === id);
        if (!record && (id === user.id)) {
            endLoader(loader);
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, EmbedIconType.XP, 'You are not on the experience leaderboard.'));
            return CommandReturn.EXIT;
        }

        if (!record) {
            endLoader(loader);
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, EmbedIconType.XP, `${asMention(target)} is not on the experience board.`));
            return CommandReturn.EXIT;
        }

        let data = nextLevelData(record);
        let amount = Math.floor((data.percent * 10));
        let o1 = record.detailed_xp[0];
        let o2 = record.detailed_xp[1];
        let leveling = `:left_right_arrow: ${o1.toLocaleString()}/${o2.toLocaleString()} XP [${'▰'.repeat(amount)}${'▱'.repeat((10 - amount))}] (${(data.percent * 100).toFixed(2)}%)`;

        let who = id !== user.id
            ? asMention(target) 
            : 'You';

        let after = who === 'You'
            ? 'are'
            : 'is';

        let idx = res.indexOf(record);
        let position = idx + 1;
        let str = `${bold('Leaderboard Overview')}` 
                + `\n${who} ${after} ${bold(ordinalSuffix(position))} on the leaderboard.`
                + `\n${who} ${after} ${bold(`Level ${record.level.toLocaleString()}`)} with ${bold(record.xp.toLocaleString() + ' XP')}.`
                + `\n\n${bold('Leveling')}`
                + `\n${leveling}`
                + `\n\n${bold('Ranking Insights')}` 
                + `\n${position == 1 
                        ? `:first_place: ${who} ${after} at the top of the leaderboard.` 
                        : `:arrow_down: ${who} ${after} ${bold(getUpwardXpDifference(res, idx).toLocaleString() + ' XP')} behind ${asMention(res[idx - 1].id)}`}` 
                + `\n${position == res.length 
                        ? `:upside_down: ${who} ${after} at the bottom of the leaderboard.` 
                        : `:arrow_up: ${who} ${after} ${bold(getDownwardXpDifference(res, idx).toLocaleString() + ' XP')} ahead of ${asMention(res[idx + 1].id)}`}`;

        let mover = '\n\n';
        if (position <= 10) {
            let res = await getTopMovers(message.guild.id, 10, DAY_MILLIS);
            let record = res?.find(record => record.client === id);
            if (!res || !record) {
                return;
            }

            mover += `${bold('Activity Insights')}\n` 
                    + `:asterisk: ${bold('#' + (res.indexOf(record) + 1))} in Top Movers (1d)`;

            str += mover; 
        }

        endLoader(loader);

        await message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, EmbedIconType.XP, str)
            .setThumbnail(id === user.id ? user.avatarURL() : target.avatarURL()));

        return CommandReturn.EXIT;
    }

}