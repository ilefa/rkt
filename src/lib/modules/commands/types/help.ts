import { Message, Permissions, User } from 'discord.js';
import { EmbedIconType, getEmoteForCommandPermission } from '../../../util';
import {
    bold,
    Command,
    CommandReturn,
    CUSTOM_PERMS,
    emboss,
    MultiCommand,
    replaceAll
} from '@ilefa/ivy';

export class HelpCommand extends Command {
    
    constructor() {
        super('help', `Invalid usage: ${emboss('.help [category]')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let commands = this.manager.commands;
        let helpList = '';

        commands
            .filter(_cmd => !_cmd.command.hideFromHelp)
            .filter(_cmd => this.manager.engine.has(user, _cmd.command.permission, message.guild))
            .sort((a, b) => {
                let ap = a.command.permission === CUSTOM_PERMS.SUPER_PERMS 
                    ? -a.command.permission 
                    : a.command.permission;
                
                let bp = b.command.permission === CUSTOM_PERMS.SUPER_PERMS
                    ? -b.command.permission
                    : b.command.permission;

                return bp - ap;
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
        if (this.manager.engine.has(user, CUSTOM_PERMS.SUPER_PERMS, message.guild)) {
            legend += `${getEmoteForCommandPermission(CUSTOM_PERMS.SUPER_PERMS)} Super User\n\t${bold('rkt')} developers and other select cool people\n\n`;
        }

        if (this.manager.engine.has(user, Permissions.FLAGS.ADMINISTRATOR, message.guild)) {
            legend += `${getEmoteForCommandPermission(Permissions.FLAGS.ADMINISTRATOR)} Administrator\n\t${bold(message.guild.name)} server administrators\n\n`;
        }

        legend += `${getEmoteForCommandPermission(Permissions.FLAGS.SEND_MESSAGES)} Member\n\t${bold(message.guild.name)} server members`;

        message.reply(this.manager.engine.embeds.build('rkt help', EmbedIconType.HELP, `${bold('rkt')} version 0.1 (master)\n` 
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

}