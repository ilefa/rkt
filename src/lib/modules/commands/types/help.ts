import { Message, Permissions, User } from 'discord.js';
import { EmbedIconType, getEmoteForCommandPermission } from '../../../util';

import {
    bold,
    Command,
    CommandReturn,
    CustomPermissions,
    emboss,
    MultiCommand,
    replaceAll
} from '@ilefa/ivy';

enum PermissionSorting {
    MEMBER,
    MOD,
    ADMIN,
    SUPER
}

export class HelpCommand extends Command {
    
    constructor() {
        super('help', `Invalid usage: ${emboss('.help')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let commands = this.manager.commands;
        let helpList = '';

        commands
            .filter(_cmd => !_cmd.command.hideFromHelp)
            .filter(_cmd => this.engine.has(user, _cmd.command.permission, message.guild))
            .sort((a, b) => {
                let ap = this.getPermissionSort(a.command.permission);
                let bp = this.getPermissionSort(b.command.permission);

                return ap - bp;
            })
            .map(_cmd => {
                let command = _cmd.command;
                let help = replaceAll(command.help.split('Invalid usage: ')[1], '``', '');
                if (help === '.' + command.name) {
                    help = null;
                }

                if (command instanceof MultiCommand) {
                    help = null;
                }

                // ignores dumb help messages
                if (!command.help.includes('Invalid usage')) {
                    help = null;
                }

                let perm = getEmoteForCommandPermission(command.permission);
                helpList += `${perm + ' ' + bold('.' + command.name + (help ? ':' : ''))} ${help ? help : ''}\n`;
            });

        let legend = '';
        if (this.engine.has(user, CustomPermissions.SUPER_PERMS, message.guild)) {
            legend += `${getEmoteForCommandPermission(CustomPermissions.SUPER_PERMS)} Super User\n\t${bold('rkt')} developers and other select cool people\n\n`;
        }

        if (this.engine.has(user, Permissions.FLAGS.ADMINISTRATOR, message.guild)) {
            legend += `${getEmoteForCommandPermission(Permissions.FLAGS.ADMINISTRATOR)} Administrator\n\t${bold(message.guild.name)} server administrators\n\n`;
        }

        if (this.engine.has(user, Permissions.FLAGS.BAN_MEMBERS, message.guild)) {
            legend += `${getEmoteForCommandPermission(Permissions.FLAGS.BAN_MEMBERS)} Moderators\n\t${bold(message.guild.name)} server moderators\n\n`
        }

        legend += `${getEmoteForCommandPermission(Permissions.FLAGS.SEND_MESSAGES)} Member\n\t${bold(message.guild.name)} server members`;

        message.reply(this.embeds.build('rkt help', EmbedIconType.HELP, `${bold('rkt')} version ${bold(await this.engine.getCurrentVersion())} ${bold(`(${await this.engine.getReleaseChannel()})`)}\n` 
            + `Made with lots of :blue_heart: and :rocket: by <@177167251986841600> & <@268044207854190604>.\n\n`
            + `${bold(`Command List (${commands.length})`)}\n` 
            + helpList.trim(),
            [
                {
                    name: 'Permissions Legend',
                    value: legend.trim(),
                    inline: false
                }    
            ], message));

        return CommandReturn.EXIT;
    }

    private getPermissionSort = (perm: number) => {
        if (perm === Permissions.FLAGS.SEND_MESSAGES)
            return PermissionSorting.MEMBER;

        if (perm === Permissions.FLAGS.BAN_MEMBERS)
            return PermissionSorting.MOD;

        if (perm === Permissions.FLAGS.ADMINISTRATOR)
            return PermissionSorting.ADMIN;

        if (perm === CustomPermissions.SUPER_PERMS)
            return PermissionSorting.SUPER;
    }

}