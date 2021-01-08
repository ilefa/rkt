import moment from 'moment';
import BirthdayManager from '../../../../birthday';
import CommandComponent from '../../../components/component';

import { CommandReturn } from '../../../command';
import { Message, Permissions, User } from 'discord.js';
import {
    asMention,
    bold,
    emboss,
    generateEmbed,
    generateSimpleEmbed,
    getExpDate
} from '../../../../../../util';

export default class SetBirthdayCommand extends CommandComponent<BirthdayManager> {

    constructor() {
        super('set', 'set <mm/dd>', Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }

        let expDate: Date;
        if (args[0]) {
            let date = getExpDate(args[0]);
            if (!date || date.toString() === 'Invalid Date') {
                message.reply(generateEmbed('.birthday | Argument Error', `Invalid birthdate: ${emboss(args[0])}.`, [
                    {
                        name: 'Valid Date Specification',
                        value: emboss(`mm/dd`),
                        inline: true
                    }
                ]));
                
                return CommandReturn.EXIT;
            }

            expDate = date;
        }

        this.manager.store(message.guild, user, expDate.getTime());
        message.reply(generateSimpleEmbed('Birthdays', `${asMention(user)}'s birthday has been updated to ${bold(moment(expDate).format('MMMM Do'))}.`))
        return CommandReturn.EXIT;
    }
    
}