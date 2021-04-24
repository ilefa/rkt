import { spawn } from 'child_process';
import { Message, User } from 'discord.js';
import { EmbedIconType } from '../../../util';
import { bold, Command, CommandReturn, CustomPermissions, emboss } from '@ilefa/ivy';

export class UpdateCommand extends Command {

    constructor() {
        super('update', `Invalid usage: ${emboss('.update')}`, null, [], CustomPermissions.SUPER_PERMS, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let ver = await this.engine.getCurrentVersion();
        let channel = await this.engine.getReleaseChannel();
        
        await this.engine.update(async version => {
            if (ver.toLowerCase() === version.toLowerCase()) {
                message.reply(this.embeds.build('Updater', EmbedIconType.TEST, `${bold('rkt')} is already up-to-date.`, null, message));
                return CommandReturn.EXIT;
            }

            if (ver.toLowerCase() === 'Failure') {
                message.reply(this.embeds.build('Updater', EmbedIconType.TEST, `:x: Something went wrong while performing updates.`, null, message));
                return CommandReturn.EXIT;
            }

            message.reply(this.embeds.build('Updater', EmbedIconType.TEST, `${bold('rkt')} updated to ${emboss(version)} via release channel ${emboss(channel)}.\n\n`, null, message));
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