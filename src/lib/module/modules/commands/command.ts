import CommandManager from './manager';

import { LOADER } from '../../../util';
import { User, Message, EmbedFieldData } from 'discord.js';

export abstract class Command {
    
    name: string;
    help: string;
    helpTitle: string;
    helpFields: EmbedFieldData[];
    permission: number;
    deleteMessage: boolean;
    hideFromHelp: boolean;
    manager: CommandManager;
    loadStart: number;
    loader: Message;

    /**
     * Default constructor for a command
     * 
     * @param name the name of the command (used to execute)
     * @param help the help message of the command
     * @param helpTitle the custom title of the help embed
     * @param helpFields the fields of the help message embed
     * @param permission the required permission
     * @param deleteMessage whether or not to delete the original command message
     * @param hideFromHelp whether or not to hide this command from the help menu
     */
    constructor(name: string,
                help: string,
                helpTitle: string,
                helpFields: EmbedFieldData[],
                permission: number,
                deleteMessage = true,
                hideFromHelp = false) {
        this.name = name;
        this.help = help;
        this.helpTitle = helpTitle;
        this.helpFields = helpFields;
        this.permission = permission;
        this.deleteMessage = deleteMessage;
        this.hideFromHelp = hideFromHelp;
    }

    /**
     * Command Execution Method
     * 
     * @param user the user who executed the command
     * @param message the original message object
     * @param args the arguments provided for the command
     */
    abstract execute(user: User, message: Message, args: string[]): Promise<CommandReturn>;
    
    async startLoader(message: Message, emote?: string, prompt?: string) {
        this.loadStart = Date.now();
        this.loader = await message.reply(`${emote || LOADER} ${prompt || 'Working on that..'}`);
    }

    async endLoader(): Promise<number> {
        if (!this.loader) {
            return;
        }

        this.loader.delete();
        this.loader = null;

        return Number((Date.now() - this.loadStart).toFixed(2));
    }

}

export class CommandEntry {
    
    name: string;
    command: Command;

    /**
     * A wrapped command instance.
     * 
     * @param name the name of the command
     * @param command the command object
     */
    constructor(name: string, command: Command) {
        this.name = name;
        this.command = command;
    }

}

export enum CommandReturn {
    EXIT, HELP_MENU
}