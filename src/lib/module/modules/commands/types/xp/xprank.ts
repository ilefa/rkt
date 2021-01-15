import { XpBoardUser } from '../../../xp/struct';
import { getLeaderboard } from '../../../xp/api';
import { Command, CommandReturn } from '../../command';
import { Message, Permissions, User } from 'discord.js';
import {
    asMention,
    bold,
    EmbedIconType,
    emboss,
    generateSimpleEmbed,
    getDownwardXpDifference,
    getUpwardXpDifference,
    ordinalSuffix
} from '../../../../../util';

export default class XpRankCommand extends Command {

    constructor() {
        super('xprank', `Invalid usage: ${emboss('.xprank [@target]')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0 && message.mentions.members.size === 0) {
            return CommandReturn.HELP_MENU;
        }

        if (message.mentions.members.size > 1) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, EmbedIconType.XP, `Excess targets: ${args.join(' ')}`));
            return CommandReturn.EXIT;
        }

        let res: XpBoardUser[] = await getLeaderboard(message.guild.id);
        if (!res) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, EmbedIconType.XP, 'Something went wrong while retrieving data from the web.'));
            return CommandReturn.EXIT;
        }

        let mention = message.mentions.members.array()[0];
        let id = mention?.id || user.id;
        let target = res.find(u => u.id === id);
        if (!target && (id !== user.id && args.length > 0)) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, EmbedIconType.XP, `Unknown target: ${emboss(mention.user.username + '#' + mention.user.discriminator)}`));
            return CommandReturn.EXIT;
        }

        if (!target && (id === user.id)) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, EmbedIconType.XP, 'You are not on the experience leaderboard.'));
            return CommandReturn.EXIT;
        }

        let who = id !== user.id
            ? bold(mention.displayName) 
            : 'You';

        let after = who === 'You'
            ? 'are'
            : 'is';

        let idx = res.indexOf(target);
        let position = idx + 1;
        let str = `${bold('Leaderboard Position')}` 
                + `\n${who} ${after} ${bold(ordinalSuffix(position))} on the leaderboard.` 
                + `\n\n${bold('Ranking Insights')}` 
                + `\n${position == 1 
                        ? `:first_place: ${who} ${after} at the top of the leaderboard.` 
                        : `:arrow_down: ${who} ${after} ${bold(getUpwardXpDifference(res, idx).toLocaleString() + ' XP')} behind ${asMention(res[idx - 1].id)}`}` 
                + `\n${position == res.length 
                        ? `:upside_down: ${who} ${after} at the bottom of the leaderboard.` 
                        : `:arrow_up: ${who} ${after} ${bold(getDownwardXpDifference(res, idx).toLocaleString() + ' XP')} ahead of ${asMention(res[idx + 1].id)}`}`;

        message.reply(generateSimpleEmbed(`${message.guild.name} - Experience Board`, EmbedIconType.XP, str)
            .setThumbnail(id === user.id ? user.avatarURL() : mention.user.avatarURL()));
        return CommandReturn.EXIT;
    }

}