import { User, Message, Permissions } from 'discord.js';
import { Command, CommandReturn, emboss } from '@ilefa/ivy';

export class KingCommand extends Command {
    
    constructor() {
        super('king', `Invalid usage: ${emboss('.king <emote>')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false, false, [], [], true);
    }
    
    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }
        
        message.channel.send(`King ${args[0].trim()}:\n\n` 
            + `      :crown:\n` 
            + `      ${args[0].trim()}\n` 
            + `:muscle::shirt::muscle:\n`
            + `      :jeans:\n`
            + ` :foot::foot:\n\n` 
        );

        return CommandReturn.EXIT;
    }

}