import { Message, User } from 'discord.js';
import { Command, CommandReturn, CustomPermissions, emboss } from '@ilefa/ivy';

export class SayCommand extends Command {

    constructor() {
        super('say', `Invalid usage: ${emboss('.say <message..>')}`, null, [], CustomPermissions.SUPER_PERMS);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length < 1) return CommandReturn.HELP_MENU;
        message.channel.send(args.join(' '));
        return CommandReturn.EXIT;
    }

}