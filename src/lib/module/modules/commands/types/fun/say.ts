import { Message, User } from 'discord.js';
import { CUSTOM_PERMS, emboss } from '../../../../../util';
import { Command, CommandCategory, CommandReturn } from '../../command';

export default class SayCommand extends Command {

    constructor() {
        super('say', CommandCategory.GENERAL, `Invalid usage: ${emboss('.say <message..>')}`, null, [], CUSTOM_PERMS.SUPERMAN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length < 1) return CommandReturn.HELP_MENU;
        message.channel.send(args.join(' '));
        return CommandReturn.EXIT;
    }

}