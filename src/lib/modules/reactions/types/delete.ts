import { ReactionHandler } from '../handler';
import { Message, MessageReaction, Permissions, User } from 'discord.js';

export class DeleteMessageReactionHandler extends ReactionHandler {

    constructor() {
        // :x:
        super('❌', Permissions.FLAGS.ADMINISTRATOR, false);
    }

    async execute(user: User, message: Message, isBot: boolean, reactionClass: MessageReaction) {
        message.delete();
    }

}