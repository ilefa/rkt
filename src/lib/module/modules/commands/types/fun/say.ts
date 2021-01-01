import { Message, User } from 'discord.js';
import { CUSTOM_PERMS, emboss } from '../../../../../util';
import { Command, CommandReturn } from '../../command';

export default class SayCommand extends Command {

    constructor() {
        super('say', `Invalid usage: ${emboss('.stonks')}`, null, [], CUSTOM_PERMS.SUPERMAN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        message.channel.send(args.join(' '));
        return CommandReturn.EXIT;
    }

}