import { Message, Permissions, User } from 'discord.js';
import { bold, emboss, toggleReactions } from '../../lib/util';
import { Command, CommandReturn } from '../command';

export default class ReactCommand extends Command {

    constructor() {
        super('react', `Invalid usage: ${emboss('.react')}`, null, [], Permissions.FLAGS.ADMINISTRATOR);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        message.delete();

        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let state = toggleReactions();
        message.reply(`${state ? ':white_check_mark:' : ':x:'} ${bold('Reactions')} are ${state ? 'now' : 'no longer'} enabled.`);
        return CommandReturn.EXIT;
    }

}