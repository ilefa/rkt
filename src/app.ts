import env from '../env.json';
import Watermark from './lib/startup';
import DataProvider from './lib/data';
import PollManager from './lib/modules/poll';
import CustomEventManager from './lib/modules/events';
import ReactionManager from './lib/modules/reactions/manager';

import { Client } from 'discord.js';

import {
    CommandManager,
    DefaultEventManager,
    IvyEngine,
    Logger,
    Module
} from '@ilefa/ivy';

import {
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
    FuturesCommand,
    HelpCommand,
    InvitesCommand,
    KingCommand,
    MaldCommand,
    MembersCommand,
    MinorCommand,
    OptionsCommand,
    PermissionsCommand,
    QuoteCommand,
    PollCommand,
    PrefsCommand,
    SayCommand,
    SectionCommand,
    SoundCommand,
    StimmyCommand,
    StonksCommand, 
    StopCommand, 
    UpdateCommand, 
    UptimeCommand, 
    VersionCommand, 
    WhereAmIFlow,
    WhoHasCommand, 
    YtPlayCommand,
} from './lib/modules/commands';

export default class RktBot extends IvyEngine {

    pollHandler: PollManager;
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
                '592924575831031821',
                '140520164629151744',
                '224566699448336384'
            ],
            reportErrors: [
                '785050947407052821'
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

    private requireModule = <T extends Module>(name: string) =>
        this
            .moduleManager
            .modules
            .find(module => module.name.toLowerCase() === name.toLowerCase()) as T;

    onReady(_client: Client): void {
        // fuckery to setup a custom event manager
        let def = this.requireModule<DefaultEventManager>('Events');
        let handler = new CustomEventManager(
                this,
                this.requireModule<CommandManager>('Commands'),
                this.requireModule<ReactionManager>('Reactions'),
                this.requireModule<PollManager>('Polls'));

        // deactivate default manager
        let modules = this.moduleManager.modules;
        if (def) {
            def.end();
            modules = modules.filter(_ => _.name !== def.name);
        }

        // register our own and set it in opts
        this.opts.eventHandler = handler;
        this.registerModule(handler);
    }

    registerCommands() {
        this.registerCommand('avatar', new AvatarCommand());
        this.registerCommand('bigjannie', new BigJannieCommand());
        this.registerCommand('contract', new ContractCommand());
        this.registerCommand('course', new CourseCommand());
        this.registerCommand('dc', new DisconnectCommand());
        this.registerCommand('eval', new EvalCommand());
        this.registerCommand('flow', new FlowCommand());
        this.registerCommand('futures', new FuturesCommand());
        this.registerCommand('help', new HelpCommand());
        this.registerCommand('invites', new InvitesCommand());
        this.registerCommand('king', new KingCommand());
        this.registerCommand('mald', new MaldCommand());
        this.registerCommand('members', new MembersCommand());
        this.registerCommand('minor', new MinorCommand());
        this.registerCommand('options', new OptionsCommand());
        this.registerCommand('perms', new PermissionsCommand());
        this.registerCommand('quote', new QuoteCommand());
        this.registerCommand('poll', new PollCommand());
        this.registerCommand('prefs', new PrefsCommand());
        this.registerCommand('say', new SayCommand());
        this.registerCommand('section', new SectionCommand());
        this.registerCommand('sound', new SoundCommand());
        this.registerCommand('stimmy', new StimmyCommand());
        this.registerCommand('stonks', new StonksCommand());
        this.registerCommand('stop', new StopCommand(this.moduleManager));
        this.registerCommand('update', new UpdateCommand());
        this.registerCommand('uptime', new UptimeCommand(this.start));
        this.registerCommand('version', new VersionCommand());
        this.registerCommand('whohas', new WhoHasCommand());
        this.registerCommand('ytplay', new YtPlayCommand());
    }

    registerModules() {
        this.reactionHandler = new ReactionManager();
        this.reactionHandler.registerHandler('delete', new DeleteMessageReactionHandler());
        this.reactionHandler.registerHandler('onlygoesup', new OnlyGoesUpReactionHandler());
        this.registerModule(this.reactionHandler);

        this.registerModule(this.pollHandler = new PollManager());
    }

    registerFlows() {
        this.registerFlow(new WhereAmIFlow());
    }

}

new RktBot();