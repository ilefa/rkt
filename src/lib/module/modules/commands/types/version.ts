import { Message, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../command';
import { getCurrentVersion, getReleaseChannel, getUpstreamVersion } from '../../../../util/vcs';
import {
    bold,
    CUSTOM_PERMS,
    EmbedIconType,
    emboss,
    generateSimpleEmbed
} from '../../../../util';

export default class VersionCommand extends Command {

    constructor() {
        super('version', CommandCategory.MISC, `Invalid usage: ${emboss('.version')}`, null, [], CUSTOM_PERMS.SUPERMAN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let ver = await getCurrentVersion();
        let channel = await getReleaseChannel();
        let upstream = await getUpstreamVersion();

        message.reply(generateSimpleEmbed('Version', EmbedIconType.TEST,
            `This instance of ${bold('rkt')} is running version ${emboss(ver)} via release channel ${emboss(channel)}.\n\n` 
            + `${bold('Updater')}\n` 
            + `${upstream.toLowerCase() !== ver.toLowerCase() 
                ? `Found new version ${emboss(upstream)} via release channel ${emboss(channel)}.\nExecute ${bold('.update')} to install updates.` 
                : `This version is up-to-date. ${emboss('(' + upstream + ' via git:' + channel + ')')}`}`));

        return CommandReturn.EXIT;
    }

}