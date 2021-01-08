import moment from 'moment';
import BirthdayManager from '../../../../birthday';
import CommandComponent from '../../../components/component';

import { CommandReturn } from '../../../command';
import { Message, Permissions, User } from 'discord.js';
import {
    asMention,
    bold,
    generateSimpleEmbed,
    join
} from '../../../../../../util';

export default class ListBirthdaysCommand extends CommandComponent<BirthdayManager> {

    constructor() {
        super('list', 'list', Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let loading = await message.reply('<a:loading:788890776444207194> Working on that..');
        let birthdays = this.manager.getBirthdays(message.guild.id);
        let content = '';

        for (let day of birthdays.records) {
            let users = day.users;
            let str = join(users, ', ', user => asMention(user) + ', ');
            str = str.substring(0, str.length - 2).replace(/\,(?!.*\,)/, ' and');
            content += bold(moment(day.date).format('MMMM Do')) + ': ' + str + '\n';
        }

        message.reply(generateSimpleEmbed('Birthday List', content))
        loading.delete();
        return CommandReturn.EXIT;
    }
    
}