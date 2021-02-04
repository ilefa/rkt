import { Message, User } from 'discord.js';
import { Command, CommandReturn } from '../command';
import { getCurrentVersion, getReleaseChannel } from '../../../../util/vcs';
import {
    bold,
    CUSTOM_PERMS,
    EmbedIconType,
    emboss,
    generateSimpleEmbed
} from '../../../../util';

export default class VersionCommand extends Command {

    constructor() {
        super('version', `Invalid usage: ${emboss('.version')}`, null, [], CUSTOM_PERMS.SUPERMAN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let ver = await getCurrentVersion();
        let channel = await getReleaseChannel();
        message.reply(generateSimpleEmbed('Version', EmbedIconType.TEST, `This instance of ${bold('rkt')} is running version ${emboss(ver)} via release channel ${emboss(channel)}.`))
        return CommandReturn.EXIT;
    }

}