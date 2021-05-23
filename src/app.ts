import env from '../env.json';
import Watermark from './lib/startup';
import DataProvider from './lib/data';
import PollManager from './lib/modules/poll';
import AudioManager from './lib/modules/audio';
import CustomEventManager from './lib/modules/events';

import { Client } from 'discord.js';
import { IvyEngine, Logger } from '@ilefa/ivy';

import {
    ReactionManager,
    DeleteMessageReactionHandler,
    OnlyGoesUpReactionHandler
} from './lib/modules/reactions';

import {
    AvatarCommand,
    BigJannieCommand,
    ContractCommand,
    CourseCommand,
    DisconnectCommand,
    EvalCommand,
    FlowCommand,
    FunnyCommand,
    FuturesCommand,
    GetRealCommand,
    HelpCommand,
    InvitesCommand,
    KingCommand,
    LoopCommand,
    MaldCommand,
    MembersCommand,
    MinorCommand,
    NowPlayingCommand, 
    OptionsCommand,
    PermissionsCommand,
    QuoteCommand,
    PauseCommand,
    PlayCommand,
    PollCommand,
    PrefsCommand,
    QueueCommand,
    SayCommand,
    SectionCommand,
    ShuffleCommand,
    SkipCommand,
    SoundCommand,
    StimmyCommand,
    StonksCommand, 
    StopCommand,
    UConnStatusCommand,
    UpdateCommand, 
    UptimeCommand, 
    VersionCommand, 
    VolumeCommand,
    WhereAmIFlow,
    WhoHasCommand,
} from './lib/modules/commands';

export default class RktBot extends IvyEngine {

    pollHandler: PollManager;
    audioManager: AudioManager;
    reactionHandler: ReactionManager;

    constructor() {
        super({
            token: env.token,
            name: 'rkt',
            logger: new Logger(),
            gitRepo: 'ilefa/rkt',
            superPerms: [
                '177167251986841600',
                '268044207854190604',
                '248149168323821569',
                '224566699448336384',
                '140520164629151744',
                '298217416276836354'
            ],
            reportErrors: [
                '785050947407052821',
                '613783446464102612'
            ],
            color: 0x27AE60,
            provider: new DataProvider(),
            startup: new Watermark(),
            presence: {
                status: 'online',
                activity: {
                    type: 'LISTENING',
                    name: 'rocket thrusters',
                    url: 'https://open.spotify.com/track/7GhIk7Il098yCjg4BQjzvb?si=FOvlyk-xQ_q50JIUVi_vNg',
                }
            },
            discord: {
                partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
                fetchAllMembers: true,
            },
        })
    }

    onReady(_client: Client): void {
        this.registerEventHandler(new CustomEventManager(this, this.commandManager, this.reactionHandler, this.pollHandler));        
    }

    registerCommands() {
        this.registerCommand('avatar', new AvatarCommand());
        this.registerCommand('bigjannie', new BigJannieCommand());
        this.registerCommand('contract', new ContractCommand());
        this.registerCommand('course', new CourseCommand());
        this.registerCommand('dc', new DisconnectCommand());
        this.registerCommand('eval', new EvalCommand());
        this.registerCommand('flow', new FlowCommand());
        this.registerCommand('funny', new FunnyCommand());
        this.registerCommand('futures', new FuturesCommand());
        this.registerCommand('getreal', new GetRealCommand());
        this.registerCommand('help', new HelpCommand());
        this.registerCommand('invites', new InvitesCommand());
        this.registerCommand('king', new KingCommand());
        this.registerCommand('loop', new LoopCommand());
        this.registerCommand('mald', new MaldCommand());
        this.registerCommand('members', new MembersCommand());
        this.registerCommand('minor', new MinorCommand());
        this.registerCommand('now', new NowPlayingCommand());
        this.registerCommand('options', new OptionsCommand());
        this.registerCommand('perms', new PermissionsCommand());
        this.registerCommand('queue', new QueueCommand());
        this.registerCommand('quote', new QuoteCommand());
        this.registerCommand('pause', new PauseCommand());
        this.registerCommand('play', new PlayCommand());
        this.registerCommand('poll', new PollCommand());
        this.registerCommand('prefs', new PrefsCommand());
        this.registerCommand('say', new SayCommand());
        this.registerCommand('section', new SectionCommand());
        this.registerCommand('shuffle', new ShuffleCommand());
        this.registerCommand('skip', new SkipCommand());
        this.registerCommand('sound', new SoundCommand());
        this.registerCommand('stimmy', new StimmyCommand());
        this.registerCommand('stonks', new StonksCommand());
        this.registerCommand('stop', new StopCommand(this.moduleManager));
        this.registerCommand('ucs', new UConnStatusCommand());
        this.registerCommand('update', new UpdateCommand());
        this.registerCommand('uptime', new UptimeCommand(this.start));
        this.registerCommand('version', new VersionCommand());
        this.registerCommand('vol', new VolumeCommand());
        this.registerCommand('whohas', new WhoHasCommand());
    }

    registerModules() {
        this.reactionHandler = new ReactionManager();
        this.reactionHandler.registerHandler('delete', new DeleteMessageReactionHandler());
        this.reactionHandler.registerHandler('onlygoesup', new OnlyGoesUpReactionHandler());
        
        this.registerModule(this.reactionHandler);
        this.registerModule(this.audioManager = new AudioManager());
        this.registerModule(this.pollHandler = new PollManager());
    }

    registerFlows() {
        this.registerFlow(new WhereAmIFlow());
    }

}

new RktBot();