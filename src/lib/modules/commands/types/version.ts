import { Message, User } from 'discord.js';
import { EmbedIconType } from '../../../util';
import { bold, Command, CommandReturn, CUSTOM_PERMS, emboss } from '@ilefa/ivy';

export class VersionCommand extends Command {

    constructor() {
        super('version', `Invalid usage: ${emboss('.version')}`, null, [], CUSTOM_PERMS.SUPER_PERMS, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let ver = await this.manager.engine.getCurrentVersion();
        let channel = await this.manager.engine.getReleaseChannel();
        let upstream = await this.manager.engine.getUpstreamVersion();

        message.reply(this.manager.engine.embeds.build('Version', EmbedIconType.TEST,
            `This instance of ${bold('rkt')} is running version ${emboss(ver)} via release channel ${emboss(channel)}.\n\n` 
            + `${bold('Updater')}\n` 
            + `${upstream.toLowerCase() !== ver.toLowerCase() && upstream !== 'unknown'
                ? `Found new version ${emboss(upstream)} via release channel ${emboss(channel)}.\nExecute ${bold('.update')} to install updates.` 
                : `This version is up-to-date. ${emboss('(' + upstream + ' via git:' + channel + ')')}`}`, null, message));

        return CommandReturn.EXIT;
    }

}