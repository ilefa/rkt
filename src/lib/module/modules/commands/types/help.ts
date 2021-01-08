import { Command, CommandReturn } from '../command';
import { Message, Permissions, User } from 'discord.js';
import {
    bold,
    emboss,
    generateSimpleEmbedWithImage,
    replaceAll
} from '../../../../util';

export default class HelpCommand extends Command {
    
    constructor() {
        super('help', `Invalid usage: ${emboss('.help')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }
    
    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let commands = this.manager.commands;
        let helpList = '';

        commands
            .filter(_cmd => !_cmd.command.hideFromHelp)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(_cmd => {
                let command = _cmd.command;
                let help = replaceAll(command.help.split('Invalid usage: ')[1], '``', '');
                if (help === '.' + command.name) {
                    help = null;
                }

                // ignores dumb help messages
                if (!command.help.includes('Invalid usage')) {
                    help = null;
                }

                helpList += `${bold('.' + command.name + (help ? ':' : ''))} ${help ? help : ''}\n`;
            });

        message.reply(generateSimpleEmbedWithImage('Stonks Help', `${bold('Stonks')} version 0.1 (master)\n` 
            + `Made with lots of :blue_heart: and :rocket: by <@177167251986841600> & <@268044207854190604>.\n\n`
            + `${bold('Command List')}\n`
            + `${helpList}`, message.client.user.avatarURL()));

        return CommandReturn.EXIT;
    }

}