import { EmbedIconType } from '../../../../util';
import { Command, CommandReturn, emboss, findUser } from '@ilefa/ivy';
import { Message, MessageAttachment, Permissions, User } from 'discord.js';

export class AvatarCommand extends Command {

    constructor() {
        super('avatar', `Invalid usage: ${emboss('.avatar [@mention | id]')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        let target: User = await findUser(message, args[0], null);
        if (!target) {
            message.reply(this.embeds.build(`.avatar | Error`, EmbedIconType.ERROR, `Invalid or unknown target: ${emboss(args[0] || '[missing]')}`, null, message));
            return CommandReturn.EXIT;
        }

        message.reply(new MessageAttachment(target.avatarURL({ size: 4096 })));
        return CommandReturn.EXIT;
    }

}