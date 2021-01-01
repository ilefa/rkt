import CommandManager from './manager';

import {
    User,
    Message,
    EmbedFieldData
} from 'discord.js';

export abstract class Command {
    
    name: string;
    help: string;
    helpTitle: string;
    helpFields: EmbedFieldData[];
    permission: number;
    deleteMessage: boolean;
    manager: CommandManager;

    /**
     * Default constructor for a command
     * 
     * @param name the name of the command (used to execute)
     * @param help the help message of the command
     * @param helpTitle the custom title of the help embed
     * @param helpFields the fields of the help message embed
     * @param permission the required permission
     */
    constructor(name: string,
                help: string,
                helpTitle: string,
                helpFields: EmbedFieldData[],
                permission: number,
                deleteMessage = true) {
        this.name = name;
        this.help = help;
        this.helpTitle = helpTitle;
        this.helpFields = helpFields;
        this.deleteMessage = deleteMessage;
        this.permission = permission;
    }

    /**
     * Command Execution Method
     * 
     * @param user the user who executed the command
     * @param message the original message object
     * @param args the arguments provided for the command
     */
    abstract execute(user: User, message: Message, args: string[]): Promise<CommandReturn>;

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