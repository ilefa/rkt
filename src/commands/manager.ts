import env from '../../env.json';

import { Command, CommandEntry, CommandReturn } from './command';
import { User, Message, MessageEmbed } from 'discord.js';
// import { bold, getLatestTimeValue } from '../lib/util';

export default class CommandManager {
    
    commands: CommandEntry[];
    
    constructor() {
        this.commands = [];
    }

    registerCommand(name: string, command: Command) {
        command.manager = this;
        this.commands.push(new CommandEntry(name, command));
    }

    findCommand(name: string): CommandEntry {
        return this.commands.find(cmd => cmd.name === name);
    }

    async handle(user: User, message: Message) {
        let split = message.content.substring(1).split(' ');
        let name = split.splice(0, 1)[0];
        let args = split.splice(0, split.length);

        for (const cmd of this.commands) {
            if (cmd.name.toLowerCase() === name) {
                try {
                    // let bypass = env.bypass.some(id => user.id === id);
                    // let recharge = this.rateLimiter.get(user.id);
                    // if (!bypass && recharge > 0) {
                    //     message.reply(`:hourglass: ${bold('Recharge:')} You cannot use this command for another ${getLatestTimeValue(recharge)}.`);
                    //     break;
                    // }

                    if (!message.guild.member(user).hasPermission(cmd.command.permission) && !env.superPerms.some(id => user.id === id)) {
                        message.reply(`:x: You don't have permission to do this.`);
                        break;
                    }

                    let result = await cmd.command.execute(user, message, args);
                    // if (!bypass) {
                    //     this.rateLimiter.set(user.id, 2000);
                    // }
                    
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
                    message.reply(':x: Something went wrong while processing your command.');
                    console.error(e);
                }
            }
        }
    }

}