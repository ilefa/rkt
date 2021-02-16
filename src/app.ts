import env from '../env.json';
import discord from 'discord.js';

import ModuleManager from './lib/module/manager';
import PollManager from './lib/module/modules/poll';
import EventManager from './lib/module/modules/events';
import Announcer from './lib/module/modules/announcer';
import XpTracker from './lib/module/modules/xp/tracker';
import BirthdayManager from './lib/module/modules/birthday';
import CommandManager from './lib/module/modules/commands/manager';
import CountHerManager from './lib/module/modules/counther/manager';
import ReactionManager from './lib/module/modules/reactions/manager';
import VoiceBoardManager from './lib/module/modules/vcboard/manager';

import * as Logger from './lib/logger';

import {
    AlertsCommand,
    AvatarCommand,
    BigJannieCommand,
    BirthdayCommand,
    ContractCommand,
    CountHerCommand,
    CourseCommand,
    DisconnectCommand,
    EvalCommand,
    FuturesCommand,
    HelpCommand,
    InvitesCommand,
    IsMarketOpenCommand,
    JackCommand,
    KingCommand,
    MaldCommand,
    MembersCommand,
    MinorCommand,
    OptionsCommand,
    PassFailCommand,
    PermissionsCommand,
    PollCommand,
    PrefsCommand,
    PurgeCommand,
    QuoteCommand,
    ReactCommand,
    SayCommand,
    SectionCommand,
    SoundCommand,
    StackCommand,
    StimmyCommand,
    StonksCommand,
    StopCommand,
    TestGameEmbedCommand,
    UpdateCommand,
    UptimeCommand,
    VersionCommand,
    VoiceAdminCommand,
    VoiceBoardCommand,
    VoiceRankCommand,
    WhoHasCommand,
    XpBoardCommand,
    XpCompareCommand,
    XpRankCommand,
    XpTopCommand,
    XpTrackCommand,
    YtPlayCommand
} from './lib/module/modules/commands'; 

import {
    DeleteMessageReactionHandler,
    OnlyGoesUpReactionHandler
} from './lib/module/modules/reactions';

import { printStartup } from './lib/startup';
import { getCurrentVersion, getReleaseChannel } from './lib/util/vcs';

const start = Date.now();
const client = new discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    fetchAllMembers: true,
});

const moduleManager = new ModuleManager(client);
const commandCenter = new CommandManager(client);
const countHerManager = new CountHerManager(client);
const birthdayManager = new BirthdayManager(client);
const voiceBoardManager = new VoiceBoardManager(client);
const reactionManager = new ReactionManager();
const pollManager = new PollManager();

commandCenter.registerCommand('alerts', new AlertsCommand());
commandCenter.registerCommand('avatar', new AvatarCommand());
commandCenter.registerCommand('bigjannie', new BigJannieCommand());
commandCenter.registerCommand('birthday', new BirthdayCommand(birthdayManager));
commandCenter.registerCommand('contract', new ContractCommand());
commandCenter.registerCommand('counther', new CountHerCommand(countHerManager));
commandCenter.registerCommand('course', new CourseCommand());
commandCenter.registerCommand('dc', new DisconnectCommand());
commandCenter.registerCommand('eval', new EvalCommand());
commandCenter.registerCommand('futures', new FuturesCommand());
commandCenter.registerCommand('help', new HelpCommand());
commandCenter.registerCommand('invites', new InvitesCommand());
commandCenter.registerCommand('ismarketopen', new IsMarketOpenCommand());
commandCenter.registerCommand('jack', new JackCommand());
commandCenter.registerCommand('king', new KingCommand());
commandCenter.registerCommand('mald', new MaldCommand());
commandCenter.registerCommand('members', new MembersCommand());
commandCenter.registerCommand('minor', new MinorCommand());
commandCenter.registerCommand('options', new OptionsCommand());
commandCenter.registerCommand('perms', new PermissionsCommand());
commandCenter.registerCommand('quote', new QuoteCommand());
commandCenter.registerCommand('pf', new PassFailCommand());
commandCenter.registerCommand('poll', new PollCommand());
commandCenter.registerCommand('prefs', new PrefsCommand());
commandCenter.registerCommand('purge', new PurgeCommand());
commandCenter.registerCommand('react', new ReactCommand());
commandCenter.registerCommand('say', new SayCommand());
commandCenter.registerCommand('section', new SectionCommand());
commandCenter.registerCommand('sound', new SoundCommand());
commandCenter.registerCommand('stack', new StackCommand());
commandCenter.registerCommand('stimmy', new StimmyCommand());
commandCenter.registerCommand('stonks', new StonksCommand());
commandCenter.registerCommand('stop', new StopCommand(moduleManager));
commandCenter.registerCommand('tge', new TestGameEmbedCommand());
commandCenter.registerCommand('update', new UpdateCommand());
commandCenter.registerCommand('uptime', new UptimeCommand(start));
commandCenter.registerCommand('vcadmin', new VoiceAdminCommand(voiceBoardManager));
commandCenter.registerCommand('vcboard', new VoiceBoardCommand(voiceBoardManager));
commandCenter.registerCommand('vcrank', new VoiceRankCommand(voiceBoardManager));
commandCenter.registerCommand('version', new VersionCommand());
commandCenter.registerCommand('whohas', new WhoHasCommand());
commandCenter.registerCommand('xpboard', new XpBoardCommand());
commandCenter.registerCommand('xpcompare', new XpCompareCommand());
commandCenter.registerCommand('xprank', new XpRankCommand());
commandCenter.registerCommand('xptop', new XpTopCommand());
commandCenter.registerCommand('xptrack', new XpTrackCommand());
commandCenter.registerCommand('ytplay', new YtPlayCommand());

reactionManager.registerHandler('delete', new DeleteMessageReactionHandler());
reactionManager.registerHandler('onlygoesup', new OnlyGoesUpReactionHandler());

printStartup();

moduleManager.registerModule(commandCenter);
moduleManager.registerModule(countHerManager);
moduleManager.registerModule(birthdayManager);
moduleManager.registerModule(reactionManager);
moduleManager.registerModule(voiceBoardManager);
moduleManager.registerModule(new Announcer(client));
moduleManager.registerModule(new EventManager(commandCenter,
                                              countHerManager,
                                              reactionManager,
                                              pollManager));

moduleManager.registerModule(new XpTracker());
moduleManager.init();

client.on('ready', async () => {
    Logger.info('rkt', `Release channel: ${await getReleaseChannel()}, version: ${await getCurrentVersion()}`);
    Logger.info('rkt', 'Successfully connected to Discord.');

    client.user.setPresence({
        status: 'online',
        activity: {
            type: 'LISTENING',
            name: 'rocket thrusters',
            url: 'https://open.spotify.com/track/7GhIk7Il098yCjg4BQjzvb?si=FOvlyk-xQ_q50JIUVi_vNg',
        }
    });
});

client.login(env.token);