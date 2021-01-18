import { ReactionHandler } from '../reactionHandler';
import { Message, MessageReaction, Permissions, User } from 'discord.js';

export default class DelteMessageReactionHandler extends ReactionHandler {

    constructor() {
        // :x:
        super('❌', Permissions.FLAGS.ADMINISTRATOR, true);
    }

    async execute(user: User, message: Message, isBot: boolean, reactionClass: MessageReaction) {
        if (isBot) message.delete();
    }

}