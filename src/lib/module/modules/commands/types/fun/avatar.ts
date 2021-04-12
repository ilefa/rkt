import { Command, CommandCategory, CommandReturn } from '../../command';

import {
    Message,
    MessageAttachment,
    Permissions,
    User
} from 'discord.js';

import {
    EmbedIconType,
    emboss,
    findUser,
    generateSimpleEmbed
} from '../../../../../util';

export default class AvatarCommand extends Command {

    constructor() {
        super('avatar', CommandCategory.GENERAL, `Invalid usage: ${emboss('.avatar [@mention | id]')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        let target: User = await findUser(message, args[0], user);
        if (!target) {
            message.reply(generateSimpleEmbed(`.avatar | Error`, EmbedIconType.ERROR, `Invalid or unknown target: ${emboss(args[0] || '[missing]')}`));
            return CommandReturn.EXIT;
        }

        let attach = new MessageAttachment(target.avatarURL({ size: 4096 }))
        message.reply(attach);
        return CommandReturn.EXIT;
    }

}