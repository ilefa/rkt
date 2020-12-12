import discord from 'discord.js';
import env from '../env.json';

import Announcer from './lib/announcer';
import CommandManager from './commands/manager';
import ReactionManager from './reactions/manager';

import {
    AlertsCommand,
    ContractCommand,
    FlipCommand,
    IsMarketOpenCommand,
    OptionsCommand,
    PermissionsCommand,
    QuoteCommand,
    ReactCommand,
    SayCommand,
    StimmyCommand,
    StonksCommand
} from './commands'; 

import { DeleteMessageReactionHandler, OnlyGoesUpReactionHandler } from './reactions';
import { MessageReaction, User } from 'discord.js';
import { containsReactPhrase } from './lib/util';

const client = new discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const announcer = new Announcer(client);
const commandCenter = new CommandManager();
const reactionCenter = new ReactionManager();

commandCenter.registerCommand('alerts', new AlertsCommand());
commandCenter.registerCommand('contract', new ContractCommand());
commandCenter.registerCommand('flip', new FlipCommand());
commandCenter.registerCommand('ismarketopen', new IsMarketOpenCommand());
commandCenter.registerCommand('options', new OptionsCommand());
commandCenter.registerCommand('perms', new PermissionsCommand());
commandCenter.registerCommand('quote', new QuoteCommand());
commandCenter.registerCommand('react', new ReactCommand());
commandCenter.registerCommand('say', new SayCommand());
commandCenter.registerCommand('stimmy', new StimmyCommand());
commandCenter.registerCommand('stonks', new StonksCommand());

reactionCenter.registerHandler('delete', new DeleteMessageReactionHandler());
reactionCenter.registerHandler('onlygoesup', new OnlyGoesUpReactionHandler());

announcer.init();

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
    if (message.author.bot) return;

    if (containsReactPhrase(message) && env.react) {
        await message.react(client.emojis.resolveID('786296476757524490'));
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