import { Message, Permissions, User } from 'discord.js';
import { emboss } from '../../lib/util';
import { Command, CommandReturn } from '../command';

export default class FlipCommand extends Command {

    constructor() {
        super('flip', `Invalid usage: ${emboss('.flip <url>')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        message.delete();

        if (args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }

        // TODO: flip this bitch so it only goes up kthx

        return CommandReturn.EXIT;
    }

}