import MultiCommand from '../components/multi';

import { Message, Permissions, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../command';
import { getCurrentVersion, getReleaseChannel } from '../../../../util/vcs';
import {
    bold,
    capitalizeFirst,
    CUSTOM_PERMS,
    EmbedIconType,
    emboss,
    generateEmbed,
    generateSimpleEmbed,
    getEmoteForCommandPermission,
    has,
    join,
    LOOKING,
    replaceAll
} from '../../../../util';

const CATEGORIES = [
    'all',
    'audio',
    'fun',
    'general',
    'misc',
    'stonks',
    'uconn',
    'xp'
];

export default class HelpCommand extends Command {
    
    constructor() {
        super('help', CommandCategory.GENERAL, `Invalid usage: ${emboss('.help [category]')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            message.reply(generateEmbed('rkt help', EmbedIconType.HELP, `${bold('rkt')} version ${emboss(`${await getCurrentVersion()} (git:${await getReleaseChannel()})`)} made with lots of :blue_heart: and :rocket: by <@177167251986841600> & <@268044207854190604>.\n` 
            + `View commands for different categories by using ${emboss('.help <category>')}\n\n`
            + `${bold(`Command Categories`)}\n` 
            + join(CATEGORIES, '\n', str => ` • ${str}`) + '\n',
            [
                {
                    name: 'Command Argument Guide',
                    value: `When looking at command help menus, arguments are laid out\nin such a way where their parameter requirements are obvious.\n` 
                         + `Required arguments are labeled with ${emboss('<arg>')},\nand optional arguments are labeled with ${emboss('[arg]')}.\n\n`
                         + `For example, for the quote command, the ${emboss('ticker')} argument is required,\n`
                         + `while the ${emboss('range')} and ${emboss('interval')} arguments are both optional.\n\n`

                         + `Some commands also have additional depth in their help menus,\nproviding specific instructions for`
                         + `what to supply in each argument.\nThese commands are usually specialized, such as ${emboss('.quote')}.`,
                    inline: false
                },
                {
                    name: 'Command Help Menus',
                    value: `For any command, you can type ${emboss('.command -h')} to view it's help menu.`,
                    inline: false
                }   
            ]));
            return CommandReturn.EXIT;
        }

        if (args.length > 1) {
            return CommandReturn.HELP_MENU;
        }

        let all = args[0].toLowerCase() === 'all';
        let category: CommandCategory = CommandCategory[args[0].toUpperCase()];
        if (isNaN(category) && !all) {
            message.reply(generateSimpleEmbed('rkt help', EmbedIconType.HELP, `Invalid help category: ${emboss(args[0])}`));
            return CommandReturn.EXIT;
        }

        let commands = this.manager.commands;
        if (!all) commands = commands.filter(({ command }) => command.category === category);
        if (!commands || !commands.length) {
            message.reply(generateSimpleEmbed('rkt help', EmbedIconType.HELP, `No commands in category ${emboss(args[0])}.`));
            return CommandReturn.EXIT;
        }

        let helpList = '';

        commands
            .filter(_cmd => !_cmd.command.hideFromHelp)
            .filter(_cmd => has(user, _cmd.command.permission, message.guild))
            .sort((a, b) => {
                let ap = a.command.permission === CUSTOM_PERMS.SUPERMAN 
                    ? -a.command.permission 
                    : a.command.permission;
                
                let bp = b.command.permission === CUSTOM_PERMS.SUPERMAN
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
        if (has(user, CUSTOM_PERMS.SUPERMAN, message.guild)) {
            legend += `${getEmoteForCommandPermission(CUSTOM_PERMS.SUPERMAN)} Super User\n\t${bold('rkt')} developers and other select people\n\n`;
        }

        if (has(user, Permissions.FLAGS.ADMINISTRATOR, message.guild)) {
            legend += `${getEmoteForCommandPermission(Permissions.FLAGS.ADMINISTRATOR)} Administrator\n\t${bold(message.guild.name)} server administrators\n\n`;
        }

        legend += `${getEmoteForCommandPermission(Permissions.FLAGS.SEND_MESSAGES)} Member\n\t${bold(message.guild.name)} server members`;

        if (!helpList || !helpList.length) {
            helpList = `${LOOKING} Doesn't look like there's anything here`;
        }

        message.reply(generateEmbed(`rkt help » ${args[0].toLowerCase()}`, EmbedIconType.HELP, `${bold('rkt')} version ${emboss(`${await getCurrentVersion()} (git:${await getReleaseChannel()})`)}\n\n` 
            + `${all ? '' : bold(`${capitalizeFirst(args[0]) + ' '}Command List (${commands.length})`)}\n` 
            + helpList.trim(),
            [
                {
                    name: 'Permissions Legend',
                    value: legend.trim(),
                    inline: false
                }    
            ]));

        return CommandReturn.EXIT;
    }

}