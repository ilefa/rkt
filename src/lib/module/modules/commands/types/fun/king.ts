import { emboss } from '../../../../../util';
import { User, Message, Permissions } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../../command';

export default class KingCommand extends Command {
    
    constructor() {
        super('king', CommandCategory.FUN, `Invalid usage: ${emboss('.king <emote>')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
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