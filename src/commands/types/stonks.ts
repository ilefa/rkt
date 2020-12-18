import { Message, MessageEmbed, Permissions, User } from 'discord.js';
import { Command, CommandReturn } from '../command';
import { emboss } from '../../lib/util';

export default class HelpCommand extends Command {

    constructor() {
        super('stonks', `Invalid usage: ${emboss('.stonks')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let embed = new MessageEmbed()
            .setTitle('Stonks Bot')
            .setColor(0x27AE60)
            .setThumbnail('https://styles.redditmedia.com/t5_2th52/styles/communityIcon_4411rfa4elr41.png?width=256&s=bba3f4384cbcb8590f768f4446d98f7b2017beb0')
            .setDescription('stonks. only. go. up.\n' 
                        + 'anyone who tells you otherwise is in kahoots with the SEC, the stock exchanges, and the banks. dont trust (or bet on) the banks.\n' 
                        + 'they are trying to take over everything.\n' 
                        + 'we ride at dawn and will take back what is ours.\n\n'

                        + 'we will never forget what citron did to pltr.\n' 
                        + 'citron = WSB public enemy #1\n\n'

                        + 'we will also never forget all the boomers that shorted pfizer\n'
                        + 'and beaurocrats that decided not to push for EUA on pfizer\n'
                        + 'and idiots that blocked stimulus and threw the market into chaos\n\n' 
                        
                        + ':rocket: :rocket: :rocket: :rocket: :rocket: :rocket: :rocket: :rocket: :rocket: :rocket: :rocket:\n\n' 
                        + 'made by <@177167251986841600> & <@268044207854190604>');

        message.reply(embed);
        return CommandReturn.EXIT;
    }

}