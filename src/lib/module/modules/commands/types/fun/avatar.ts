import { Command, CommandReturn } from '../../command';
import { Message, MessageAttachment, Permissions, User } from 'discord.js';
import {
    EmbedIconType,
    emboss,
    generateSimpleEmbed,
    SNOWFLAKE_REGEX,
    USER_MENTION_REGEX
} from '../../../../../util';

export default class AvatarCommand extends Command {

    constructor() {
        super('avatar', `Invalid usage: ${emboss('.avatar [@mention | id]')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        let target: User = user;
        if (args[0]) {
            let client = args[0];
            let temp = null;
            if (SNOWFLAKE_REGEX.test(client)) {
                temp = await message.client.users.fetch(client);
            }
    
            if (USER_MENTION_REGEX.test(client)) {
                let id = client.slice(3, client.length - 1);
                temp = await message.client.users.fetch(id);
            }
    
            if (!temp) {
                message.reply(generateSimpleEmbed(`.avatar | Error`, EmbedIconType.ERROR, `Invalid or unknown target: ${emboss(client)}`));
                return CommandReturn.EXIT;
            }

            target = temp;
        }

        let attach = new MessageAttachment(target.avatarURL({ size: 4096 }))
        message.reply(attach);
        return CommandReturn.EXIT;
    }

}