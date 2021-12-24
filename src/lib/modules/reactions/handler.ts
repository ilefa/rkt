import { Message, MessageReaction, User } from 'discord.js';

export abstract class ReactionHandler {

    /**
     * Default constructor for a reaction handler
     * 
     * @param emote the id of the emote (or unicode emoji for default emotes)
     * @param permission the required permission
     * @param onBot boolean if the reaction needs to be on the bot
     */
    constructor(public emote: string, public permission: number, public onBot: boolean) {}

    /**
     * Reacion Handler Execution Method
     * 
     * @param user the user who reacted with the emote
     * @param message the message reacted on
     * @param isBot whether the message reacted to is sent by the bot
     * @param reactionObject the reaction object recieved from the API
     */
    abstract execute(user: User, message: Message, isBot: boolean, reactionObject: MessageReaction): void;

}

export class ReactionHandlerEntry {

    /**
     * A wrapped reaction handler instance.
     * 
     * @param name the name of the reaction handler
     * @param reactionHandler the reaction handler object
     */
    constructor(public name: string, public reactionHandler: ReactionHandler) {}

}