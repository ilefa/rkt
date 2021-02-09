import env from '../../../../env.json';
import * as Logger from '../../logger';

import Module from '../module';
import PollManager from './poll';
import CommandManager from './commands/manager';
import CountHerManager from './counther/manager';
import ReactionManager from './reactions/manager';

import { MessageReaction, TextChannel, User } from 'discord.js';
import {
    bold,
    codeBlock,
    EmbedIconType,
    generateEmbed,
    getReactionPhrase
} from '../../util';

export default class EventManager extends Module {

    commandCenter: CommandManager;
    countHerManager: CountHerManager;
    reactionManager: ReactionManager;
    pollManager: PollManager;
    commandDeck: TextChannel;

    constructor(commandCenter: CommandManager,
                countHerManager: CountHerManager,
                reactionManager: ReactionManager,
                pollManager: PollManager) {
        super('Events');
        
        this.commandCenter = commandCenter;
        this.countHerManager = countHerManager;
        this.reactionManager = reactionManager;
        this.pollManager = pollManager;
    }

    async start() {
        const { client, commandCenter, countHerManager, reactionManager, pollManager } = this;
        
        client.on('ready', async () => this.commandDeck = await client.channels.fetch(env.commandDeck, false) as TextChannel);
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
        
            if (message.content.toLowerCase().startsWith('poll:')) {
                await pollManager.handleSimple(message);
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

            if (reaction.message.embeds.length && reaction.message?.embeds[0]?.author?.name === "Polls") {
                await this.pollManager.handleAdd(reaction, user);
            }

            reactionManager.handle(reaction, user, reaction.message.author.bot);
        });

        client.on('messageReactionRemove', async (reaction: MessageReaction, user: User) => {
            if (user.bot) return;
            if (reaction.partial) {
                await reaction.fetch();
            }
        
            if (reaction.message.embeds.length && reaction.message?.embeds[0]?.author?.name === "Polls") {
                await this.pollManager.handle(reaction);
            }
        });

        process.on('unhandledRejection', (err: any) => {
            if (err.message.includes('Unknown Message')) return;
            if (err.fatal) this.commandDeck?.send('@everyone');

            this.commandDeck?.send(generateEmbed('Severe', EmbedIconType.ERROR, `Encountered a ${err.fatal ? 'fatal' : 'uncaught'} exception.${err.fatal ? `\n${bold('rkt')} cannot recover from this incident and will now shutdown.` : ''}`, [
                {
                    name: 'Error',
                    value: err.message,
                    inline: false
                },
                {
                    name: 'Stack',
                    value: codeBlock('', err.stack),
                    inline: false
                }
            ]));

            Logger.except(err, 'rkt', `Encountered a ${err.fatal ? 'fatal' : 'uncaught'} exception`);
            Logger.severe('rkt', err.stack);
        });

        process.on('uncaughtException', async (err: any) => {
            if (err.fatal) this.commandDeck?.send('@everyone');
            this.commandDeck?.send(generateEmbed('Severe', EmbedIconType.ERROR, `Encountered a ${err.fatal ? 'fatal' : 'uncaught'} exception.${err.fatal ? `\n${bold('rkt')} cannot recover from this incident and will now shutdown.` : ''}`, [
                {
                    name: 'Error',
                    value: err.message,
                    inline: false
                },
                {
                    name: 'Stack',
                    value: codeBlock('', err.stack),
                    inline: false
                }
            ]));

            Logger.except(err, 'rkt', `Encountered a ${err.fatal ? 'fatal' : 'uncaught'} exception`);
            Logger.severe('rkt', err.stack);
        });
    }

    end() {}

}