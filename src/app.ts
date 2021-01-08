import discord from 'discord.js';
import env from '../env.json';

import ModuleManager from './lib/module/manager';
import PollManager from './lib/module/modules/poll';
import EventManager from './lib/module/modules/events';
import Announcer from './lib/module/modules/announcer';
import XpTracker from './lib/module/modules/xp/tracker';
import BirthdayManager from './lib/module/modules/birthday';
import CommandManager from './lib/module/modules/commands/manager';
import CountHerManager from './lib/module/modules/counther/manager';
import ReactionManager from './lib/module/modules/reactions/manager';

import * as Logger from './lib/logger';

import {
    AlertsCommand,
    BigJannieCommand,
    BirthdayCommand,
    ContractCommand,
    CountHerCommand,
    CourseSearchCommand,
    FuturesCommand,
    HelpCommand,
    IsMarketOpenCommand,
    JackCommand,
    OptionsCommand,
    PermissionsCommand,
    PollCommand,
    PrefsCommand,
    PurgeCommand,
    QuoteCommand,
    ReactCommand,
    SayCommand,
    StackCommand,
    StimmyCommand,
    StonksCommand,
    StopCommand,
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
const birthdayManager = new BirthdayManager(client);
const reactionManager = new ReactionManager();
const pollManager = new PollManager();

commandCenter.registerCommand('alerts', new AlertsCommand());
commandCenter.registerCommand('bigjannie', new BigJannieCommand());
commandCenter.registerCommand('birthday', new BirthdayCommand(birthdayManager));
commandCenter.registerCommand('contract', new ContractCommand());
commandCenter.registerCommand('counther', new CountHerCommand(countHerManager));
commandCenter.registerCommand('csearch', new CourseSearchCommand());
commandCenter.registerCommand('futures', new FuturesCommand());
commandCenter.registerCommand('help', new HelpCommand());
commandCenter.registerCommand('ismarketopen', new IsMarketOpenCommand());
commandCenter.registerCommand('jack', new JackCommand());
commandCenter.registerCommand('options', new OptionsCommand());
commandCenter.registerCommand('perms', new PermissionsCommand());
commandCenter.registerCommand('quote', new QuoteCommand());
commandCenter.registerCommand('poll', new PollCommand());
commandCenter.registerCommand('prefs', new PrefsCommand());
commandCenter.registerCommand('purge', new PurgeCommand());
commandCenter.registerCommand('react', new ReactCommand());
commandCenter.registerCommand('say', new SayCommand());
commandCenter.registerCommand('stack', new StackCommand());
commandCenter.registerCommand('stimmy', new StimmyCommand());
commandCenter.registerCommand('stonks', new StonksCommand());
commandCenter.registerCommand('stop', new StopCommand());
commandCenter.registerCommand('xpboard', new XpBoardCommand());
commandCenter.registerCommand('xpcompare', new XpCompareCommand());
commandCenter.registerCommand('xprank', new XpRankCommand());
commandCenter.registerCommand('xptop', new XpTopCommand());
commandCenter.registerCommand('xptrack', new XpTrackCommand());

reactionManager.registerHandler('delete', new DeleteMessageReactionHandler());
reactionManager.registerHandler('onlygoesup', new OnlyGoesUpReactionHandler());

printStartup();

moduleManager.registerModule(commandCenter);
moduleManager.registerModule(countHerManager);
moduleManager.registerModule(birthdayManager);
moduleManager.registerModule(reactionManager);
moduleManager.registerModule(new Announcer(client));
moduleManager.registerModule(new EventManager(commandCenter,
                                              countHerManager,
                                              reactionManager,
                                              pollManager));

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