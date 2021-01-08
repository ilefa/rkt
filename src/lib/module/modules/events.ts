import env from '../../../../env.json';

import Module from '../module';
import CommandManager from './commands/manager';
import CountHerManager from './counther/manager';
import PollManager from './poll';
import ReactionManager from './reactions/manager';

import { getReactionPhrase } from '../../util';
import { MessageReaction, User } from 'discord.js';

export default class EventManager extends Module {

    commandCenter: CommandManager;
    countHerManager: CountHerManager;
    reactionCenter: ReactionManager;
    pollManager: PollManager;

    constructor(commandCenter: CommandManager, countHerManager: CountHerManager, reactionCenter: ReactionManager, pollManager: PollManager) {
        super('Events');
        this.commandCenter = commandCenter;
        this.countHerManager = countHerManager;
        this.reactionCenter = reactionCenter;
        this.pollManager = pollManager;
    }

    start() {
        const { client, commandCenter, countHerManager, reactionCenter } = this;
        client.on('message', async message => {
            if (message.author.bot) {
                return;
            }
            
            if (env.react) {
                let phrase = getReactionPhrase(message);
                if (phrase) {
                    await message.react(client.emojis.resolveID(phrase.response));
                }
            }
        
            if (countHerManager.isLobby(message.channel.id)) {
                await countHerManager.handleInput(message);
            }
        
            if (!message.content.startsWith(env.prefix)) {
                return;
            }
        
            commandCenter.handle(message.author, message);
        });
        
        client.on('messageReactionAdd', async (reaction: MessageReaction, user: User) => {
            if (user.bot) return;
            if (reaction.partial) {
                await reaction.fetch();
            }
            if (reaction.message.embeds.length && reaction.message.embeds[0].title === "Polls") {
                await this.pollManager.handleAdd(reaction, user);
            }

            reactionCenter.handle(reaction, user, reaction.message.author.bot);
        });

        client.on('messageReactionRemove', async (reaction: MessageReaction, user: User) => {
            if (user.bot) return;
            if (reaction.partial) {
                await reaction.fetch();
            }
        
            if (reaction.message.embeds.length && reaction.message.embeds[0].title === "Polls") {
                await this.pollManager.handle(reaction);
            }
        });
    }

    end() {}

}