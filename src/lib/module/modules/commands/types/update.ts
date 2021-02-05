import { spawn } from 'child_process';
import { Message, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../command';
import { getCurrentVersion, getReleaseChannel, update } from '../../../../util/vcs';
import {
    bold,
    CUSTOM_PERMS,
    EmbedIconType,
    emboss,
    generateSimpleEmbed
} from '../../../../util';

export default class UpdateCommand extends Command {

    constructor() {
        super('update', CommandCategory.MISC, `Invalid usage: ${emboss('.update')}`, null, [], CUSTOM_PERMS.SUPERMAN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let ver = await getCurrentVersion();
        let channel = await getReleaseChannel();
        
        await update(async version => {
            if (ver.toLowerCase() === version.toLowerCase()) {
                message.reply(generateSimpleEmbed('Updater', EmbedIconType.TEST, `${bold('rkt')} is already up-to-date.`));
                return CommandReturn.EXIT;
            }

            message.reply(generateSimpleEmbed('Updater', EmbedIconType.TEST, `${bold('rkt')} updated to ${emboss(version)} via release channel ${emboss(channel)}.\n\n`));
            setTimeout(() => {
                process.on('exit', () => {
                    spawn(process.argv.shift(), process.argv, {
                        cwd: process.cwd(),
                        detached: true,
                        stdio: 'inherit'
                    });
                });
                process.exit();
            }, 5000);
        });
         
        return CommandReturn.EXIT;
    }

}