import env from '../../env.json';

import * as Logger from '../lib/logger';

import { User, Message, MessageEmbed, Client } from 'discord.js';
import { Command, CommandEntry, CommandReturn } from './command';
import { codeBlock, generateEmbed, generateSimpleEmbed, italic, numberEnding } from '../lib/util';

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

    postInit() {
        Logger.info('Commands', `Registered ${this.commands.length} command${numberEnding(this.commands.length)}.`)
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
                    if (!message
                            .guild
                            .member(user)
                            .hasPermission(cmd.command.permission) 
                            && !env
                                .superPerms
                                .some(id => user.id === id)) {
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
                    if (env.reportErrors.includes(message.guild.id)) {
                        message.reply(generateEmbed('Huh? That wasn\'t supposed to happen..', `Something went wrong while processing your command.`, [
                            {
                                name: 'Command',
                                value: codeBlock('', name),
                                inline: true
                            },
                            {
                                name: 'Arguments',
                                value: codeBlock('json', JSON.stringify(args)),
                                inline: true
                            },
                            {
                                name: 'Error',
                                value: codeBlock('', e.message),
                                inline: false
                            },
                            {
                                name: 'Stacktrace',
                                value: codeBlock('', e.stack),
                                inline: false
                            }
                        ]));

                        console.error(e);
                        return;
                    }

                    message.reply(generateSimpleEmbed('Huh? That wasn\'t supposed to happen..', 'Something went wrong while processing your command.'));
                    console.error(e);
                }
            }
        }
    }

}