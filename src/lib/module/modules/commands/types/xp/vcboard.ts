import { Message, Permissions, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../../command';
import {
    asMention,
    bold,
    EmbedIconType,
    emboss,
    generateSimpleEmbed,
    generateSimpleEmbedWithThumbnail,
    getEmoteForXpPlacement,
    getLatestTimeValue,
    numberEnding
} from '../../../../../util';
import { VoiceBoardManager, VoiceBoardRecord } from '../../../vcboard';

export default class VoiceLeaderboardCommand extends Command {

    boardManager: VoiceBoardManager;

    constructor(boardManager: VoiceBoardManager) {
        super('vcboard', CommandCategory.XP, `Invalid usage: ${emboss('.vcboard')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
        this.boardManager = boardManager;
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0 && args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }

        this.startLoader(message);
        
        let res: VoiceBoardRecord[] = await this.boardManager.getTop(message.guild.id);
        if (!res) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board`, EmbedIconType.XP, 'Something went wrong while retrieving data from the web.'));
            return CommandReturn.EXIT;
        }
        
        let amt = res.length;
        let time = res.map(record => record.time).reduce((prev, cur) => prev + cur, 0);
        let str = '';
        
        // get top 10, or list length - 1, whichever comes first
        res = res.slice(0, Math.min(10, res.length));
        res.map((user, i) => {
            str += `${getEmoteForXpPlacement(i + 1)} ${asMention(user.user)} with ${bold(getLatestTimeValue(user.time))}\n`;
        });

        message.reply(generateSimpleEmbedWithThumbnail(`${message.guild.name} - Voice Board`, EmbedIconType.XP,
            `Tracking a collective ${bold(getLatestTimeValue(time))} between ${bold(`${amt.toLocaleString()} member${numberEnding(amt)}`)}.\n\n` + str, message.guild.iconURL()));
        return CommandReturn.EXIT;
    }

}