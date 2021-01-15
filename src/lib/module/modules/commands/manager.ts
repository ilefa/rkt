import env from '../../../../../env.json';
import Module from '../../module';

import * as Logger from '../../../logger';

import { User, Message, MessageEmbed, Client } from 'discord.js';
import { Command, CommandEntry, CommandReturn } from './command';
import { codeBlock, EmbedIconType, generateEmbed, generateSimpleEmbed, has, italic, numberEnding } from '../../../util';

export default class CommandManager extends Module {
    
    client: Client;
    commands: CommandEntry[];
    
    constructor(client: Client) {
        super('Commands');

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

    start() {
        Logger.info(this.name, `Registered ${this.commands.length} command${numberEnding(this.commands.length)}.`)
    }

    end() {
        this.commands = [];
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
                    if (!has(user, cmd.command.permission, message.guild)) {
                        message.reply(generateSimpleEmbed('Whoops', EmbedIconType.ERROR, `You don't have permission to do this.`));
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
                        .setAuthor(cmd.command.helpTitle ? cmd.command.helpTitle : `.${cmd.command.name} | Help Menu`, EmbedIconType.HELP)    
                        .setColor(0x27AE60)
                        .setDescription(cmd.command.help)
                        .addFields(cmd.command.helpFields);

                    message.reply(helpEmbed);
                    break;
                } catch (e) {
                    if (env.reportErrors.includes(message.guild.id)) {
                        message.reply(generateEmbed('Huh? That wasn\'t supposed to happen..', EmbedIconType.ERROR, `Something went wrong while processing your command.`, [
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

                        Logger.except(e, this.name, 'Encountered an exception while processing a command');
                        console.error(e.stack);
                        return;
                    }

                    message.reply(generateSimpleEmbed('Huh? That wasn\'t supposed to happen..', EmbedIconType.ERROR, 'Something went wrong while processing your command.'));
                    Logger.except(e, this.name, 'Encountered an exception while processing a command');
                }
            }
        }
    }

}