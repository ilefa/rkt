import { emboss } from '../../../../../util';
import { Message, Permissions, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../../command';

export default class MaldCommand extends Command {

    constructor() {
        super('mald', CommandCategory.FUN, `Invalid usage: ${emboss('.mald')}`, 'fleance be maldin, it never stops :(', [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        message.channel.send(null, {
            files: ["https://media.discordapp.net/attachments/784858138964262932/810011108013506610/unknown.png?width=720&height=540"]
        });

        return CommandReturn.EXIT;
    }

}