import { Message, Permissions, User } from 'discord.js';
import { Command, CommandReturn } from '../../command';

export default class StackCommand extends Command {

    constructor() {
        super('stack', `jack do be stackin tho :flushed: :flushed: :flushed:`, 'jack stack', [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        message.channel.send(null, {
            files: ["https://media.discordapp.net/attachments/793704756002291713/794480292894605312/unknown.png?width=516&height=681"]
        });

        return CommandReturn.EXIT;
    }

}