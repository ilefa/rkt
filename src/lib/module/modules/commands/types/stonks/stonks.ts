import { Message, MessageEmbed, Permissions, User } from 'discord.js';
import { Command, CommandReturn } from '../../command';
import { EmbedIconType, emboss, generateSimpleEmbed } from '../../../../../util';

export default class HelpCommand extends Command {

    constructor() {
        super('stonks', `Invalid usage: ${emboss('.stonks')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        message.reply(generateSimpleEmbed('Stonks Bot', EmbedIconType.STONKS, 'stonks. only. go. up.\n' 
            + 'anyone who tells you otherwise is in kahoots with the SEC, the stock exchanges, and the banks. dont trust (or bet on) the banks.\n' 
            + 'they are trying to take over everything.\n' 
            + 'we ride at dawn and will take back what is ours.\n\n'

            + 'we will never forget what citron did to pltr.\n' 
            + 'citron = WSB public enemy #1\n\n'

            + 'we will also never forget all the boomers that shorted pfizer\n'
            + 'and beaurocrats that decided not to push for EUA on pfizer\n'
            + 'and idiots that blocked stimulus and threw the market into chaos\n'
            + '*(fuck pfizer)*\n\n' 
            
            + ':rocket: :rocket: :rocket: :rocket: :rocket: :rocket: :rocket: :rocket: :rocket: :rocket: :rocket:\n\n' 
            + 'made by <@177167251986841600> & <@268044207854190604>'));
        return CommandReturn.EXIT;
    }

}