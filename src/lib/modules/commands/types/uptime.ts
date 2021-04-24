import { EmbedIconType } from '../../../util';
import { Message, Permissions, User } from 'discord.js';
import { bold, Command, CommandReturn, emboss, getLatestTimeValue } from '@ilefa/ivy';

export class UptimeCommand extends Command {

    uptime: number;

    constructor(uptime: number) {
        super('uptime', `Invalid usage: ${emboss('.uptime')}`, null, [], Permissions.FLAGS.ADMINISTRATOR, false);
        this.uptime = uptime;
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        message.reply(this.manager.engine.embeds.build('Uptime', EmbedIconType.PREFS, `${bold('rkt')} has been running for ${bold(getLatestTimeValue(Date.now() - this.uptime))}.`, null, message))
        return CommandReturn.EXIT;
    }

}