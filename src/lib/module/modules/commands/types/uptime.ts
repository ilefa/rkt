import { Message, Permissions, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../command';
import {
    bold,
    EmbedIconType,
    emboss,
    generateSimpleEmbed,
    getLatestTimeValue
} from '../../../../util';

export default class UptimeCommand extends Command {

    uptime: number;

    constructor(uptime: number) {
        super('uptime', CommandCategory.MISC, `Invalid usage: ${emboss('.uptime')}`, null, [], Permissions.FLAGS.ADMINISTRATOR);
        this.uptime = uptime;
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        message.reply(generateSimpleEmbed('Uptime', EmbedIconType.PREFS, `${bold('rkt')} has been running for ${bold(getLatestTimeValue(Date.now() - this.uptime))}.`))
        return CommandReturn.EXIT;
    }

}