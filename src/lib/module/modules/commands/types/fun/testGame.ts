import { Message, TextChannel, User } from "discord.js";
import { Command, CommandCategory, CommandReturn } from "../../command";
import { codeBlock, CUSTOM_PERMS, GameEmbedAwaiter } from "../../../../../util";

export default class TestGameEmbedCommand extends Command {

    constructor() {
        super('tge', CommandCategory.MISC, '[min] [max]', null, [], CUSTOM_PERMS.SUPERMAN, true, true);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        let min = args[0] 
            ? parseInt(args[0]) 
                ? parseInt(args[0]) 
                : 1 
            : 1;
            
        let max = args[1] 
            ? parseInt(args[1]) 
                ? parseInt(args[1]) 
                : 2
            : 2;

        new GameEmbedAwaiter(message.channel as TextChannel, 'Test Game Embed', min, max, 15, 120 * 1000,
            users => {
                message.reply(`:white_check_mark:\n${codeBlock('json', JSON.stringify(users, null, 3))}`);
            },
            user => true)
        return CommandReturn.EXIT;
    }

}