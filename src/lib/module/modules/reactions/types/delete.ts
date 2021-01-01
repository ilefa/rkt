import { Message, MessageReaction, Permissions, User } from 'discord.js';
import { ReactionHandler } from '../reactionHandler';

export default class DelteMessageReactionHandler extends ReactionHandler {

    constructor() {
        // :x:
        super('❌', Permissions.FLAGS.ADMINISTRATOR, true);
    }

    async execute(user: User, message: Message, isBot: boolean, reactionClass: MessageReaction) {
        if (isBot) message.delete();
    }

}