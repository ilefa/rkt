import env from '../env.json';
import Watermark from './lib/startup';
import Auditor from './lib/modules/auditor';
import PollManager from './lib/modules/poll';
import AudioManager from './lib/modules/audio';
import CustomEventManager from './lib/modules/events';

import { Client } from 'discord.js';
import { IvyEngine, Logger } from '@ilefa/ivy';

import {
    ChannelCreateProbe,
    ChannelDeleteProbe,
    ChannelPinsUpdateProbe,
    ChannelUpdateProbe,
    EmojiCreateProbe,
    EmojiDeleteProbe,
    EmojiUpdateProbe,
    GuildBanAddProbe,
    GuildBanRemoveProbe,
    GuildIntegrationsUpdateProbe,
    GuildMemberAddProbe,
    GuildMemberRemoveProbe,
    GuildMemberUpdateProbe,
    GuildUpdateProbe,
    InviteCreateProbe,
    InviteDeleteProbe,
    MessageDeleteBulkProbe,
    MessageDeleteProbe,
    MessageUpdateProbe,
    RoleCreateProbe,
    RoleDeleteProbe,
    RoleUpdateProbe,
    VoiceStateUpdateProbe,
    WebhookUpdateProbe,
} from './lib/modules/auditor/probes';

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
    ListCommandsFlow,
    ListFlowsFlow,
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
    ProcessStopCommand,
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
    ProfessorCommand
} from './lib/modules/commands';

export default class RktBot extends IvyEngine {

    auditor: Auditor;
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
            prefix: '.',
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
            }
        })
    }

    onReady(_client: Client): void {
        this.registerEventHandler(new CustomEventManager(this, this.commandManager, this.reactionHandler, this.pollHandler));  
    }

    registerCommands() {
        this.registerCommand(new AvatarCommand());
        this.registerCommand(new BigJannieCommand());
        this.registerCommand(new ContractCommand());
        this.registerCommand(new CourseCommand());
        this.registerCommand(new DisconnectCommand());
        this.registerCommand(new EvalCommand());
        this.registerCommand(new FlowCommand());
        this.registerCommand(new FunnyCommand());
        this.registerCommand(new FuturesCommand());
        this.registerCommand(new GetRealCommand());
        this.registerCommand(new HelpCommand());
        this.registerCommand(new InvitesCommand());
        this.registerCommand(new KingCommand());
        this.registerCommand(new LoopCommand());
        this.registerCommand(new MaldCommand());
        this.registerCommand(new MembersCommand());
        this.registerCommand(new MinorCommand());
        this.registerCommand(new NowPlayingCommand());
        this.registerCommand(new OptionsCommand());
        this.registerCommand(new PermissionsCommand());
        this.registerCommand(new QueueCommand());
        this.registerCommand(new QuoteCommand());
        this.registerCommand(new PauseCommand());
        this.registerCommand(new PlayCommand());
        this.registerCommand(new PollCommand());
        this.registerCommand(new PrefsCommand(this.start));
        this.registerCommand(new ProcessStopCommand(this.moduleManager));
        this.registerCommand(new ProfessorCommand());
        this.registerCommand(new SayCommand());
        this.registerCommand(new SectionCommand());
        this.registerCommand(new ShuffleCommand());
        this.registerCommand(new SkipCommand());
        this.registerCommand(new SoundCommand());
        this.registerCommand(new StimmyCommand());
        this.registerCommand(new StonksCommand());
        this.registerCommand(new StopCommand());
        this.registerCommand(new UConnStatusCommand());
        this.registerCommand(new UpdateCommand());
        this.registerCommand(new UptimeCommand(this.start));
        this.registerCommand(new VersionCommand());
        this.registerCommand(new VolumeCommand());
        this.registerCommand(new WhoHasCommand());
    }

    registerModules() {
        this.reactionHandler = new ReactionManager();
        this.reactionHandler.registerHandler('delete', new DeleteMessageReactionHandler());
        this.reactionHandler.registerHandler('onlygoesup', new OnlyGoesUpReactionHandler());
        
        this.registerModule(this.auditor = new Auditor());
        this.auditor.registerProbe(new ChannelCreateProbe());
        this.auditor.registerProbe(new ChannelDeleteProbe());
        this.auditor.registerProbe(new ChannelPinsUpdateProbe());
        this.auditor.registerProbe(new ChannelUpdateProbe());
        this.auditor.registerProbe(new EmojiCreateProbe());
        this.auditor.registerProbe(new EmojiDeleteProbe());
        this.auditor.registerProbe(new EmojiUpdateProbe());
        this.auditor.registerProbe(new GuildBanAddProbe());
        this.auditor.registerProbe(new GuildBanRemoveProbe());
        this.auditor.registerProbe(new GuildIntegrationsUpdateProbe());
        this.auditor.registerProbe(new GuildMemberAddProbe());
        this.auditor.registerProbe(new GuildMemberRemoveProbe());
        this.auditor.registerProbe(new GuildMemberUpdateProbe());
        this.auditor.registerProbe(new GuildUpdateProbe());
        this.auditor.registerProbe(new InviteCreateProbe());
        this.auditor.registerProbe(new InviteDeleteProbe());
        this.auditor.registerProbe(new MessageDeleteProbe());
        this.auditor.registerProbe(new MessageDeleteBulkProbe());
        this.auditor.registerProbe(new MessageUpdateProbe());
        this.auditor.registerProbe(new RoleCreateProbe());
        this.auditor.registerProbe(new RoleDeleteProbe());
        this.auditor.registerProbe(new RoleUpdateProbe());
        this.auditor.registerProbe(new VoiceStateUpdateProbe());
        this.auditor.registerProbe(new WebhookUpdateProbe());
        
        this.registerModule(this.reactionHandler);
        this.registerModule(this.audioManager = new AudioManager());
        this.registerModule(this.pollHandler = new PollManager());
    }

    registerFlows() {
        this.registerFlow(new ListCommandsFlow());
        this.registerFlow(new ListFlowsFlow());
        this.registerFlow(new WhereAmIFlow());
    }

}

new RktBot();