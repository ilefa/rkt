import env from '../../../../env.json';

import { Module, resolvableToId } from '@ilefa/ivy';
import {
    Client,
    GuildMember,
    GuildResolvable,
    TextChannel,
    User
} from 'discord.js';

type AuditorEntry = {
    channel: string;
    events: string[];
    tracks: string[];
}

type DuplicateEntryAction = {
    guild: string;
    entry: AuditorEntry;
}

export abstract class AuditorProbe {

    manager: Auditor;
    client: Client;

    constructor(readonly name: string, readonly eventType: typeof EventKeys[number]) {}

    abstract report(...args: any[]): void;
    abstract shouldReport(...args: any[]): boolean;

    getEntryForGuild = (guild: GuildResolvable): AuditorEntry => {
        if (!this.manager) {
            return null;
        }

        return this.manager.config.get(resolvableToId(guild));
    }

    getReportsChannel = async (guild: GuildResolvable) => {
        let entry = this.getEntryForGuild(guild);
        if (!entry) return null;

        return await this
            .client
            .channels
            .fetch(entry.channel) as TextChannel;
    }

    asName = (member: GuildMember | User) => {
        if (member instanceof GuildMember)
            member = member.user;

        return member.username + '#' + member.discriminator;
    }

}

const EventKeys = [
    'channelCreate',
    'channelDelete',
    'channelPinsUpdate',
    'channelUpdate',
    'emojiCreate',
    'emojiDelete',
    'emojiUpdate',
    'guildBanAdd',
    'guildBanRemove',
    'guildIntegrationsUpdate',
    'guildMemberAdd',
    'guildMemberRemove',
    'guildMemberUpdate',
    'guildUpdate',
    'inviteCreate',
    'inviteDelete',
    'messageDelete',
    'messageDeleteBulk',
    'messageReactionRemoveAll',
    'messageUpdate',
    'roleCreate',
    'roleDelete',
    'roleUpdate',
    'voiceStateUpdate',
    'webhookUpdate'
] as const;

export default class Auditor extends Module {

    config: Map<string, AuditorEntry>;
    probes: AuditorProbe[]; 

    readonly COG = '<:cog:847564995289284638>';
    readonly PIN = '<:pin:847284224540540941>';
    readonly CHANNEL = '<:channel:847304547516678194>';
    readonly CHANNEL_LOCKED = '<:channelLocked:847304547402907688>';
    readonly CHANNEL_NSFW = '<:channelNsfw:847304547302113331>';
    readonly CHANNEL_STAGE = '<:stageChannel:847304547473817650>';
    readonly EMOTE = '<:emote:847320072228962324>';
    readonly ROLE = '<:role:847320541270376468>';
    readonly JOIN = '<:join:798763992813928469>';
    readonly LEAVE = '<:leave:847362716498395146>';
    readonly INVITE = '<:invite:847320072153726986>';
    readonly MEMBERS = '<:members:847337907810467841>';
    readonly MENTION = '<:mention:847601027414753290>';
    readonly VOICE = '<:voice:847320072145862676>';
    readonly VOICE_LOCKED = '<:voiceLocked:847320072175353896>';
    readonly MUTE = '<:mute:847611885494992916>';
    readonly UNMUTE = '<:unmute:847611885406912542>';
    readonly DEAFEN = '<:deafen:847611885268631612>';
    readonly UNDEAFEN = '<:undeafen:847611887335899156>';
    readonly STREAM = '<:stream:847688506414596106>';
    readonly WIDGET = '<:widget:847615965084647474>';
    readonly VERIFIED = '<:verified:847618591858753609>';
    readonly WEBHOOK = '<:webhook:847690690976940032>';
    readonly DIVIDER = ':white_small_square:';

    constructor() {
        super('Auditor');
        this.config = new Map();   
        this.probes = [];   
    }

    start() {
        let config = env.auditor;
        let inUse: string[] = [];
        let dupes: DuplicateEntryAction[] = [];

        for (let entry of config) {
            let events = entry
                .events
                .filter(event => EventKeys.some(val => val === event))
                .map(event => {
                    if (!inUse.includes(event))
                        inUse.push(event)
                    return event;
                });

            if (entry.tracks.length > 1) {
                entry.tracks.slice(1).forEach(extra => {
                    dupes.push({
                        guild: extra,
                        entry: {
                            channel: entry.channel,
                            events,
                            tracks: entry.tracks
                        }
                    })
                })
            }

            this.config.set(entry.tracks[0], {
                channel: entry.channel,
                events,
                tracks: entry.tracks
            });
        }

        for (let dupe of dupes) {
            this.config.set(dupe.guild, dupe.entry);
        }

        this.manager.engine.logger.info('Auditor', `Auditor activated.`);
        this.manager.engine.logger.info('Auditor', `Events in use: [${inUse.join(', ')}]`);

        this.client.on('ready', () => {
            for (let event of inUse) {
                let handler = this.probes.find(handler => handler.eventType === event);
                if (!handler)
                    continue;
    
                this.client.on(event, (...args: any[]) => {
                    if (!handler.shouldReport(args))
                        return;

                    handler.report(args);
                });
            }
        });
    }
    
    end() {}

    registerProbe = (probe: AuditorProbe) => {
        let { logger } = this.manager.engine;
        if (this.hasDuplicateProbe(probe.eventType))
            return logger.warn('Auditor', `Blocked registration of probe ${probe.name}, with duplicate eventType ${probe.eventType}.`);

        probe.manager = this;
        probe.client = this.client;
        this.probes.push(probe);
        this.manager.engine.logger.info('Auditor', `[${probe.eventType}] probe registered.`);
    }

    private hasDuplicateProbe = (eventType: string) => this.probes.some(probe => probe.eventType === eventType);

}