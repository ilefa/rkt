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

export default class NextBirthdayCommand extends CommandComponent<BirthdayManager> {

    constructor() {
        super('next', 'next', Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let loading = await message.reply('<a:loading:788890776444207194> Working on that..');
        let next = this.manager.getNextBirthday(message.guild.id);

        if (!next) {
            message.reply(generateSimpleEmbed('Next Birthday', 'There aren\'t any birthdays coming up :('));
            return CommandReturn.EXIT;
        }

        let users = next.users;
        let str = join(users, ', ', user => asMention(user) + ', ');
        str = str.substring(0, str.length - 2).replace(/\,(?!.*\,)/, ' and');

        message.reply(generateSimpleEmbed('Birthday List', `${str}'s birthday is up next on ${bold(moment(next.date).format('MMMM Do'))}.`))
        loading.delete();
        return CommandReturn.EXIT;
    }
    
}