import env from '../../env.json';

import { Command, CommandEntry, CommandReturn } from './command';
import { User, Message, MessageEmbed, Client } from 'discord.js';
import { generateEmbed, generateSimpleEmbed, italic } from '../lib/util';

export default class CommandManager {
    
    client: Client;
    commands: CommandEntry[];
    
    constructor(client: Client) {
        this.client = client;
        this.commands = [];
    }

    /**
     * Registers a command with the given parameters.
     * 
     * @param name the name of the command
     * @param command the command class
     */
    registerCommand(name: string, command: Command) {
        command.manager = this;
        this.commands.push(new CommandEntry(name, command));
    }

    /**
     * Attempts to find a command by the given name.
     * @param name the name of the command
     */
    findCommand(name: string): CommandEntry {
        return this.commands.find(cmd => cmd.name === name);
    }

    /**
     * Attempts to handle a command message.
     * 
     * @param user the user executing the command
     * @param message the message the user sent
     */
    async handle(user: User, message: Message) {
        let split = message.content.substring(1).split(' ');
        let name = split.splice(0, 1)[0];
        let args = split.splice(0, split.length);

        for (const cmd of this.commands) {
            if (cmd.name.toLowerCase() === name) {
                try {
                    if (!message.guild.member(user).hasPermission(cmd.command.permission) && !env.superPerms.some(id => user.id === id)) {
                        message.reply(generateSimpleEmbed('Whoops', `You don't have permission to do this.`));
                        break;
                    }

                    let result = await cmd.command.execute(user, message, args);
                    if (cmd.command.deleteMessage) {
                        message.delete();
                    }
                    
                    if (result === CommandReturn.EXIT) {
                        break;
                    }

                    let helpEmbed = new MessageEmbed()
                        .setTitle(cmd.command.helpTitle ? cmd.command.helpTitle : `.${cmd.command.name} | Help Menu`)    
                        .setColor(0x27AE60)
                        .setDescription(cmd.command.help)
                        .addFields(cmd.command.helpFields)

                    message.reply(helpEmbed);
                    break;
                } catch (e) {
                    if (message.guild.id in env.reportErrors) {
                        message.reply(generateEmbed('Huh? That wasn\'t supposed to happen..', `Something went wrong while processing your command. ${italic('(check the console for more info)')}`, [
                            {
                                name: 'Error',
                                value: e.message,
                                inline: true
                            }
                        ]));
                        return;
                    }

                    message.reply(generateSimpleEmbed('Huh? That wasn\'t supposed to happen..', 'Something went wrong while processing your command.'));
                    console.error(e);
                }
            }
        }
    }

}