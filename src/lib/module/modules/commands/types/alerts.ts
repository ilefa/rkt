import { Message, Permissions, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../command';
import {
    bold,
    EmbedIconType,
    emboss,
    generateSimpleEmbed,
    toggleAlerts
} from '../../../../util';

export default class AlertsCommand extends Command {

    constructor() {
        super('alerts', CommandCategory.MISC, `Invalid usage: ${emboss('.alerts')}`, null, [], Permissions.FLAGS.ADMINISTRATOR);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let state = toggleAlerts();
        message.reply(generateSimpleEmbed('Announcer Preferences', EmbedIconType.PREFS, `${bold('Alerts')} are ${state ? 'now' : 'no longer'} enabled.`));
        
        return CommandReturn.EXIT;
    }

}