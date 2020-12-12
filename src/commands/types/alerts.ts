import env from '../../../env.json';

import { Message, Permissions, User } from 'discord.js';
import { Command, CommandReturn } from '../command';
import { bold, emboss, toggleAlerts } from '../../lib/util';

export default class AlertsCommand extends Command {

    constructor() {
        super('alerts', `:x: Invalid usage: ${emboss('.alerts')}`, null, [], Permissions.FLAGS.ADMINISTRATOR);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        message.delete();

        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let state = toggleAlerts();
        message.reply(`${state ? ':white_check_mark:' : ':x:'} ${bold('Alerts')} are ${state ? 'now' : 'no longer'} enabled.`);
        return CommandReturn.EXIT;
    }

}