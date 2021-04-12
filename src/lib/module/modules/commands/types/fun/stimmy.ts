import { Message, Permissions, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../../command';

export default class StimmyCommand extends Command {

    constructor() {
        super('stimmy', CommandCategory.FUN, `funny stimmy time`, `what did you expect to be here?`, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        message.channel.send('yes');
        return CommandReturn.EXIT;
    }

}