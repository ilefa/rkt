import { Message, Permissions, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../command';
import {
    bold,
    EmbedIconType,
    emboss,
    generateSimpleEmbed,
    toggleReactions
} from '../../../../util';

export default class ReactCommand extends Command {

    constructor() {
        super('react', CommandCategory.MISC, `Invalid usage: ${emboss('.react')}`, null, [], Permissions.FLAGS.ADMINISTRATOR);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let state = toggleReactions();
        let embed = generateSimpleEmbed('Reaction Preferences', EmbedIconType.PREFS, `${bold('Reactions')} are ${state ? 'now' : 'no longer'} enabled.`);
        message.reply(embed);
        return CommandReturn.EXIT;
    }

}