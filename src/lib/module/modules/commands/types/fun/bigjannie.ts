import { Command, CommandReturn } from '../../command';
import { Message, Permissions, User } from 'discord.js';

export default class BigJannieCommand extends Command {

    constructor() {
        super('bigjannie', `haha jannie big`, `what did you expect to be here?`, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        message.channel.send(null, {
            files: ["https://cdn.discordapp.com/attachments/778422963560644639/788266859718901770/cleanyourscreen.gif"]
        });

        return CommandReturn.EXIT;
    }

}