import discord from 'discord.js';
import env from '../env.json';

import Announcer from './lib/announcer';
import CommandManager from './commands/manager';
import CountHerManager from './lib/counther/manager';
import ReactionManager from './reactions/manager';
import XpTracker from './lib/integration/xp/tracker';

import {
    AlertsCommand,
    BigJannieCommand,
    ContractCommand,
    CountHerCommand,
    FuturesCommand,
    IsMarketOpenCommand,
    OptionsCommand,
    PermissionsCommand,
    PrefsCommand,
    PurgeCommand,
    QuoteCommand,
    ReactCommand,
    SayCommand,
    StimmyCommand,
    StonksCommand,
    XpBoardCommand,
    XpRankCommand,
    XpTrackCommand
} from './commands'; 

import {
    DeleteMessageReactionHandler,
    OnlyGoesUpReactionHandler
} from './reactions';

import { MessageReaction, User } from 'discord.js';
import { getReactionPhrase } from './lib/util';

const client = new discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const announcer = new Announcer(client);
const commandCenter = new CommandManager(client);
const countHerManager = new CountHerManager(client);
const reactionCenter = new ReactionManager();
const xpTracker = new XpTracker();

commandCenter.registerCommand('alerts', new AlertsCommand());
commandCenter.registerCommand('bigjannie', new BigJannieCommand());
commandCenter.registerCommand('contract', new ContractCommand());
commandCenter.registerCommand('counther', new CountHerCommand(countHerManager));
commandCenter.registerCommand('futures', new FuturesCommand());
commandCenter.registerCommand('ismarketopen', new IsMarketOpenCommand());
commandCenter.registerCommand('options', new OptionsCommand());
commandCenter.registerCommand('perms', new PermissionsCommand());
commandCenter.registerCommand('quote', new QuoteCommand());
commandCenter.registerCommand('prefs', new PrefsCommand());
commandCenter.registerCommand('purge', new PurgeCommand());
commandCenter.registerCommand('react', new ReactCommand());
commandCenter.registerCommand('say', new SayCommand());
commandCenter.registerCommand('stimmy', new StimmyCommand());
commandCenter.registerCommand('stonks', new StonksCommand());
commandCenter.registerCommand('xpboard', new XpBoardCommand());
commandCenter.registerCommand('xprank', new XpRankCommand());
commandCenter.registerCommand('xptrack', new XpTrackCommand());

reactionCenter.registerHandler('delete', new DeleteMessageReactionHandler());
reactionCenter.registerHandler('onlygoesup', new OnlyGoesUpReactionHandler());

announcer.init();
xpTracker.init();

client.on('ready', () => {
    console.log('Successfully connected to Discord.');
    client.user.setPresence({
        status: 'online',
        activity: {
            type: 'COMPETING',
            name: 'buying high, selling low',
        }
    })
});

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

    reactionCenter.handle(reaction, user, reaction.message.author.bot);
});

client.login(env.token);