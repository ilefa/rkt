import {
    User,
    Message,
    MessageReaction
} from 'discord.js';

export abstract class ReactionHandler {
    
    emote: string;
    permission: number;
    onBot: boolean;

    /**
     * Default constructor for a reaction handler
     * 
     * @param emote the id of the emote (or unicode emoji for default emotes)
     * @param permission the required permission
     * @param onBot boolean if the reaction needs to be on the bot
     */
    constructor(emote, permission, onBot) {
        this.emote = emote;
        this.permission = permission;
        this.onBot = onBot;
    }

    /**
     * Reacion Handler Execution Method
     * 
     * @param user the user who reacted with the emote
     * @param message the message reacted on
     * @param isBot whether the message reacted to is sent by the bot
     * @param reactionObject the reaction object recieved from the API
     */
    abstract execute(user: User, message: Message, isBot: boolean, reactionObject: MessageReaction);

}

export class ReactionHandlerEntry {
    
    name: string;
    reactionHandler: ReactionHandler;

    /**
     * A wrapped reaction handler instance.
     * 
     * @param name the name of the reaction handler
     * @param reactionHandler the reaction handler object
     */
    constructor(name: string, reactionHandler: ReactionHandler) {
        this.name = name;
        this.reactionHandler = reactionHandler;
    }

}