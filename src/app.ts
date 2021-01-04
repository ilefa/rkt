import discord from 'discord.js';
import env from '../env.json';

import Announcer from './lib/module/modules/announcer';
import ModuleManager from './lib/module/manager';
import CommandManager from './lib/module/modules/commands/manager';
import CountHerManager from './lib/module/modules/counther/manager';
import EventManager from './lib/module/modules/events';
import ReactionManager from './lib/module/modules/reactions/manager';
import XpTracker from './lib/module/modules/xp/tracker';

import * as Logger from './lib/logger';

import {
    AlertsCommand,
    BigJannieCommand,
    ContractCommand,
    CountHerCommand,
    CourseSearchCommand,
    FuturesCommand,
    IsMarketOpenCommand,
    JackCommand,
    OptionsCommand,
    PermissionsCommand,
    PrefsCommand,
    PurgeCommand,
    QuoteCommand,
    ReactCommand,
    SayCommand,
    StackCommand,
    StimmyCommand,
    StonksCommand,
    XpBoardCommand,
    XpCompareCommand,
    XpRankCommand,
    XpTopCommand,
    XpTrackCommand
} from './lib/module/modules/commands'; 

import {
    DeleteMessageReactionHandler,
    OnlyGoesUpReactionHandler
} from './lib/module/modules/reactions';

import { printStartup } from './lib/startup';

const client = new discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const moduleManager = new ModuleManager(client);
const commandCenter = new CommandManager(client);
const countHerManager = new CountHerManager(client);
const reactionCenter = new ReactionManager();

commandCenter.registerCommand('alerts', new AlertsCommand());
commandCenter.registerCommand('bigjannie', new BigJannieCommand());
commandCenter.registerCommand('contract', new ContractCommand());
commandCenter.registerCommand('counther', new CountHerCommand(countHerManager));
commandCenter.registerCommand('csearch', new CourseSearchCommand());
commandCenter.registerCommand('futures', new FuturesCommand());
commandCenter.registerCommand('ismarketopen', new IsMarketOpenCommand());
commandCenter.registerCommand('jack', new JackCommand());
commandCenter.registerCommand('options', new OptionsCommand());
commandCenter.registerCommand('perms', new PermissionsCommand());
commandCenter.registerCommand('quote', new QuoteCommand());
commandCenter.registerCommand('prefs', new PrefsCommand());
commandCenter.registerCommand('purge', new PurgeCommand());
commandCenter.registerCommand('react', new ReactCommand());
commandCenter.registerCommand('say', new SayCommand());
commandCenter.registerCommand('stack', new StackCommand());
commandCenter.registerCommand('stimmy', new StimmyCommand());
commandCenter.registerCommand('stonks', new StonksCommand());
commandCenter.registerCommand('xpboard', new XpBoardCommand());
commandCenter.registerCommand('xpcompare', new XpCompareCommand());
commandCenter.registerCommand('xprank', new XpRankCommand());
commandCenter.registerCommand('xptop', new XpTopCommand());
commandCenter.registerCommand('xptrack', new XpTrackCommand());

reactionCenter.registerHandler('delete', new DeleteMessageReactionHandler());
reactionCenter.registerHandler('onlygoesup', new OnlyGoesUpReactionHandler());

printStartup();

moduleManager.registerModule(commandCenter);
moduleManager.registerModule(countHerManager);
moduleManager.registerModule(reactionCenter);
moduleManager.registerModule(new Announcer(client));
moduleManager.registerModule(new EventManager(commandCenter, countHerManager, reactionCenter));
moduleManager.registerModule(new XpTracker());
moduleManager.init();

client.on('ready', () => {
    Logger.info('Stonks', 'Successfully connected to Discord.');
    client.user.setPresence({
        status: 'online',
        activity: {
            type: 'COMPETING',
            name: 'buying high, selling low',
        }
    });
});

client.login(env.token);