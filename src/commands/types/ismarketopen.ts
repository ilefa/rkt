import moment from 'moment';

import { Message, Permissions, User } from 'discord.js';
import { Command, CommandReturn } from '../command';

export default class IsMarketOpenCommand extends Command {

    constructor() {
        super('ismarketopen', `:x: Invalid usage: .ismarketopen`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let date = new Date();
        if ((date.getDay() >= 1 && date.getDay() <= 5) && date.getHours() >= 9 && date.getHours() < 16) {
            message.reply('yes <:PFEcat:787045790442455081>');
            return CommandReturn.EXIT;
        }

        message.reply('no <:what:786147202342060094>');
        return CommandReturn.EXIT;
    }

}