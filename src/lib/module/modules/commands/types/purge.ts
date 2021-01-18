import { Command, CommandReturn } from '../command';
import { Message, Permissions, User } from 'discord.js';
import {
    EmbedIconType,
    emboss,
    generateSimpleEmbed,
    numberEnding,
    timeDiff
} from '../../../../util';

export default class PurgeCommand extends Command {

    constructor() {
        super('purge', `Invalid usage: ${emboss('.purge <amount>')}`, null, [], Permissions.FLAGS.ADMINISTRATOR);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }

        if (isNaN(parseInt(args[0]))) {
            message.reply(generateSimpleEmbed('.purge | Argument Error', EmbedIconType.MESSAGE, `Non-Numeric Message Count ${emboss(args[0])}.`))
            return CommandReturn.EXIT;
        }

        let amount = parseInt(args[0]);
        if (amount > 100) {
            message.reply(generateSimpleEmbed('.purge | Error', EmbedIconType.MESSAGE, 'Cannot query more than 100 messages.'))
            return CommandReturn.EXIT;
        }

        let start = Date.now();
        let all = await message.channel.messages.fetch({ limit: 100 }, true);
        let messages = all
            .filter(message => message.author.id === this.manager.client.user.id)
            .array();

        if (amount > messages.length) {
            amount = messages.length;
        }

        messages = messages.slice(0, amount);
        messages.forEach(async message => message?.delete());
        message.reply(`Purged ${messages.length} message${numberEnding(messages.length)} in ${timeDiff(start)}ms.`);
        
        return CommandReturn.EXIT;
    }

}