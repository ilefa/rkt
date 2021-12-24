import { User, MessageReaction } from 'discord.js';
import { asMention, Module, numberEnding } from '@ilefa/ivy';
import { ReactionHandler, ReactionHandlerEntry } from './handler';

export class ReactionManager extends Module {
    
    handlers: ReactionHandlerEntry[];
    
    constructor() {
        super('Reactions');
        this.handlers = [];
    }

    registerHandler(name: string, reactionHandler: ReactionHandler) {
        this.handlers.push(new ReactionHandlerEntry(name, reactionHandler));
    }

    start() {
        this.manager.engine.logger.info(this.name, `Registered ${this.handlers.length} handler${numberEnding(this.handlers.length)}.`)
    }

    end() {}

    async handle(reaction: MessageReaction, user: User, isBot: boolean) {
        let msg = reaction.message;
        let checkId = (reaction.emoji.id) 
            ? reaction.emoji.id 
            : reaction.emoji.name;

        for (const rh of this.handlers) {
            if (rh.reactionHandler.emote === checkId) {
                try {
                    if (rh.reactionHandler.onBot && !isBot) break;
                    if (!this.manager.engine.has(user, rh.reactionHandler.permission, msg.guild)) {
                        break;
                    }

                    await rh.reactionHandler.execute(user, msg, isBot, reaction);
                } catch (e) {
                    reaction.message.channel.send(asMention(user) + ', :x: Something went wrong while processing your reaction.');
                    this.manager.engine.logger.except(e, this.name, 'Error processing reaction');
                }
            }
        }
    }
}