import env from '../../env.json';

import * as Logger from '../lib/logger';

import { User, MessageReaction } from 'discord.js';
import { asMention, numberEnding } from '../lib/util';
import { ReactionHandler, ReactionHandlerEntry } from './reactionHandler';

export default class ReactionManager {
    
    handlers: ReactionHandlerEntry[];
    
    constructor() {
        this.handlers = [];
    }

    registerHandler(name: string, reactionHandler: ReactionHandler) {
        this.handlers.push(new ReactionHandlerEntry(name, reactionHandler));
    }

    postInit() {
        Logger.info('Reactions', `Registered ${this.handlers.length} handler${numberEnding(this.handlers.length)}.`)
    }

    async handle(reaction: MessageReaction, user: User, isBot: boolean) {
        let msg = reaction.message;
        let checkId = (reaction.emoji.id) 
            ? reaction.emoji.id 
            : reaction.emoji.name;

        for (const rh of this.handlers) {
            if (rh.reactionHandler.emote === checkId) {
                try {
                    if (rh.reactionHandler.onBot && !isBot) break;
                    if (!msg
                            .guild
                            .member(user)
                            .hasPermission(rh.reactionHandler.permission) 
                        && !env
                            .superPerms
                            .some(id => user.id === id)) {
                        break;
                    }

                    await rh.reactionHandler.execute(user, msg, isBot, reaction);
                } catch (e) {
                    reaction.message.channel.send(asMention(user) + ', :x: Something went wrong while processing your reaction.');
                    Logger.except(e, 'Reactions', 'Error processing reaction');
                }
            }
        }
    }
}