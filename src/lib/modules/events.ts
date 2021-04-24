import env from '../../../env.json';

import PollManager from './poll';
import ReactionManager from './reactions/manager';

import { EmbedIconType } from '../util';
import { Message, MessageReaction, TextChannel, User } from 'discord.js';
import { bold, codeBlock, CommandManager, EventManager, IvyEngine } from '@ilefa/ivy';

export default class CustomEventManager extends EventManager {

    commandDeck: TextChannel;

    constructor(engine: IvyEngine,
                commandCenter: CommandManager,
                public reactionManager: ReactionManager,
                public pollManager: PollManager) {
        super(engine);
        this.commandCenter = commandCenter;
        this.reactionManager = reactionManager;
        this.pollManager = pollManager;
    }

    async start() {
        const { client, reactionManager } = this;
        
        client.on('ready', async () => this.commandDeck = await client.channels.fetch(env.commandDeck, false) as TextChannel);
        client.on('message', async (message: Message) => {
            if (message.author.bot) {
                return;
            }
                
            if (message.content.toLowerCase().startsWith('poll:')) {
                await this.pollManager.handleSimple(message);
            }
    
            try {
                // somehow provider is null and throws an exception
                let data = await this.engine.provider.load(message.guild);
                if (!message.content.startsWith(data.prefix)) {
                    return;
                }
            
                this.commandCenter.handle(message.author, message);    
            } catch (_e) {}
        })

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
    }
    
    private _exceptionHandler = async (err: any) => {
        if (err.fatal) this.commandDeck?.send('@everyone');
        this.commandDeck?.send(this.engine.embeds.build('Severe', EmbedIconType.ERROR, `Encountered a ${err.fatal ? 'fatal' : 'uncaught'} exception.${err.fatal ? `\n${bold('rkt')} cannot recover from this incident and will now shutdown.` : ''}`, [
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

        this.engine.logger.except(err, 'rkt', `Encountered a ${err.fatal ? 'fatal' : 'uncaught'} exception`);
        this.engine.logger.severe('rkt', err.stack);
    } 

    onException = (err: any) => this._exceptionHandler(err);
    onRejection = (err: any) => this._exceptionHandler(err);

}