import { User, Message, Permissions } from 'discord.js';
import { VoiceBoardRecord, VoiceBoardManager } from '../../../../vcboard';
import { Command, CommandCategory, CommandReturn } from '../../../command';
import {
    asMention,
    bold,
    EmbedIconType,
    emboss,
    endLoader,
    findUser,
    generateSimpleEmbed,
    generateSimpleEmbedWithThumbnail,
    getLatestTimeValue,
    MessageLoader,
    ordinalSuffix,
    startLoader
} from '../../../../../../util';

export default class VoiceBoardRankCommand extends Command {

    boardManager: VoiceBoardManager;

    constructor(boardManager: VoiceBoardManager) {
        super('vcrank', CommandCategory.XP, `Invalid usage: ${emboss('.vcrank [target]')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
        this.boardManager = boardManager;
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 1) {
            return CommandReturn.HELP_MENU;
        }

        if (message.mentions.members.size > 1) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board`, EmbedIconType.XP, `Excess targets: ${emboss(args.join(' '))}`));
            return CommandReturn.EXIT;
        }

        let loader: MessageLoader = await startLoader(message);
        let res: VoiceBoardRecord[] = await this.boardManager.getTop(message.guild.id);
        if (!res) {
            endLoader(loader);
            message.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board`, EmbedIconType.XP, 'Something went wrong while retrieving data from the web.'));
            return CommandReturn.EXIT;
        }

        let target: User = await findUser(message, args[0], user);
        if (!target) {
            endLoader(loader);
            message.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board`, EmbedIconType.XP, `Invalid or unknown target: ${emboss(args[0] || '[missing]')}`));
            return CommandReturn.EXIT;
        }

        let id = target.id;
        let record = res.find(r => r.user === id);
        if (!record && (id === user.id)) {
            endLoader(loader);
            message.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board`, EmbedIconType.XP, 'You are not on the voice leaderboard.'));
            return CommandReturn.EXIT;
        }

        if (!record) {
            endLoader(loader);
            message.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board`, EmbedIconType.XP, `${asMention(target)} is not on the voice board.`));
            return CommandReturn.EXIT;
        }

        let position = record.position;
        let who = id !== user.id
            ? asMention(target) 
            : 'You';

        let after = who === 'You'
            ? 'are'
            : 'is';

        let upward = position === 1 
            ? null 
            : getLatestTimeValue(res[position - 2].time - record.time);

        let downward = position === res.length
            ? null 
            : getLatestTimeValue(record.time - res[position].time);

        endLoader(loader);

        let str = `${bold('Leaderboard Overview')}\n` 
            + `${who} ${after} ${bold(ordinalSuffix(record.position))} on the leaderboard.\n` 
            + `${who} ${who === 'You' ? 'have' : 'has'} ${bold(getLatestTimeValue(record.time))} of voice time.\n\n` 
            + `${bold('Ranking Insights')}` 
            + `\n${position == 1 
                    ? `:first_place: ${who} ${after} at the top of the leaderboard.` 
                    : `:arrow_down: ${who} ${after} ${upward === '0s' 
                        ? 'tied with' 
                        : `${bold(upward)} behind of`} ${asMention(res[position - 2].user)}`}` 
            + `\n${position == res.length 
                    ? `:upside_down: ${who} ${after} at the bottom of the leaderboard.` 
                    : `:arrow_up: ${who} ${after} ${downward === '0s' 
                        ? 'tied with' 
                        : `${bold(downward)} ahead of`} ${asMention(res[position].user)}`}`;

        message.reply(generateSimpleEmbedWithThumbnail(`${message.guild.name} - Voice Board`, EmbedIconType.XP, str, target.avatarURL()));
        return CommandReturn.EXIT;
    }

}