import { ReactionHandler } from '../handler';
import { Message, MessageReaction, Permissions, User } from 'discord.js';

export class OnlyGoesUpReactionHandler extends ReactionHandler {

    constructor() {
        super('848088309166243840', Permissions.FLAGS.ADMINISTRATOR, false);
    }

    async execute(user: User, message: Message, isBot: boolean, reactionClass: MessageReaction) {
        if (isBot) return;
        await message.react(this.emote);
    }

}