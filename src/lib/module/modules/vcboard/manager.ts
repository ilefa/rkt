import path from 'path';
import Module from '../../module';
import scheduler from 'node-schedule';

import * as Logger from '../../../logger';

import { Job } from 'node-schedule';
import { Client, Guild, VoiceChannel, VoiceState } from 'discord.js';
import { initFlatFileStore, numberEnding, sleep, timeDiff } from '../../../util';

const DB_PATH = path.join(__dirname, '../../../../../', 'vcboard.json');

export default class VoiceBoardManager extends Module {

    store: any;
    jobs: Job[];
    client: Client;
    voiceMap: Map<VoiceMapResolvable, number>;

    constructor(client: Client) {
        super('Voice Board');
        this.client = client;
    }

    async start() {
        this.jobs = [];
        this.store = initFlatFileStore(DB_PATH);
        this.voiceMap = new Map<VoiceMapResolvable, number>();

        let start = Date.now();
        let ctx = this;

        await sleep(1000);
        this.client.guilds.cache.forEach(guild => {
            this.jobs.push(scheduler.scheduleJob('* * * * *',
                () => ctx.runUpdate(ctx, guild)));

            if (!ctx.store.has(guild.id)) {
                ctx.store.set(guild.id, {});
            }

            let channels = guild
                .channels
                .cache
                .filter(channel => channel.type === 'voice')
                .map(channel => channel as VoiceChannel)
                .filter(vc => vc.members.size !== 0);

            if (!channels || !channels.length) {
                return;
            }

            channels
                .map(channel => channel.members.array())
                .filter(members => members.length)
                .forEach(memberList => {
                    memberList.forEach(member => {
                        let resolvable = {
                            guild: guild.id,
                            user: member.id
                        };

                        ctx.voiceMap.set(resolvable, Date.now());
                    });
                });
        });

        Logger.info('Voice Board', `${this.voiceMap.size} passive records added.`);
        
        this.store.sync();
        this.client.on('voiceStateUpdate', (old, current) => {
            let change = this.determineChange(old, current);
            if (!change || change === VoiceStateChange.UNKNOWN) {
                return;
            }

            if (current.member.user.bot) {
                return;
            }

            if (current.channel && (current.channel?.id === current.channel.guild.afkChannelID)) {
                return;
            }

            let resolvable = {
                guild: current.guild.id,
                user: current.member.user.id
            };

            switch (change.toLowerCase()) {
                case 'connect':
                case 'undeaf':
                case 'unmute':
                    if (this.existsLocal(resolvable.user)) {
                        ctx.update(resolvable.guild, resolvable.user, Date.now() - this.getLocal(resolvable.user));
                        ctx.voiceMap.delete(resolvable);
                    }

                    ctx.voiceMap.set(resolvable, Date.now());
                    break;
                case 'disconnect':
                case 'deaf':
                case 'mute':
                    if (!this.existsLocal(resolvable.user)) {
                        break;
                    }

                    let local = this.getLocal(resolvable.user);
                    ctx.voiceMap.delete(resolvable);
                    ctx.update(resolvable.guild, resolvable.user, Date.now() - local);
                    break;
                default:
                    break;
            }
        });

        Logger.info('Voice Board', `Enabled in ${timeDiff(start)}ms.`);
    }

    end() {
        let ctx = this;
        let size = this.voiceMap.size;

        this.jobs.forEach(job => job.cancel());
        this.voiceMap.forEach((timeDiff, resolvable) => {
            ctx.update(resolvable.guild, resolvable.user, Date.now() - timeDiff);
            ctx.voiceMap.delete(resolvable);
        });

        ctx.voiceMap.clear();
        Logger.info('Voice Board', `Saved ${size} record${numberEnding(size)} to the datastore.`);
    }

    async getTop(guild: string, limit: number = 10): Promise<VoiceBoardRecord[]> {
        let data = this.store.get(guild);
        let unsorted: PartialVoiceBoardRecord[] = []; 
        let records: VoiceBoardRecord[] = [];

        Object
            .keys(data)
            .forEach(user => unsorted.push({
                user,
                time: data[`${user}`]
            }));

        unsorted
            .sort((a, b) => b.time - a.time)
            .slice(0, Math.min(unsorted.length, limit))
            .forEach((record, i) => records.push({
                user: record.user,
                time: record.time,
                position: i + 1
            }));

        return records;
    }

    private async update(guild: string, user: string, timeDiff: number) {
        let data = this.store.get(guild);
        let record = this.getStats(guild, user, timeDiff);
        data[user] = record === timeDiff 
            ? timeDiff 
            : record + timeDiff;

        this.store.set(guild, data);
        this.store.sync();
    }

    private async runUpdate(ctx: VoiceBoardManager, guild: Guild) {
        let channels = guild
            .channels
            .cache
            .filter(channel => channel.type === 'voice')
            .map(channel => channel as VoiceChannel)
            .filter(vc => vc.members.size !== 0);

        if (!channels || !channels.length) {
            return;
        }

        channels
            .map(channel => channel.members.array())
            .filter(members => members.length)
            .forEach(memberList => {
                memberList.forEach(member => {
                    let resolvable = {
                        guild: guild.id,
                        user: member.id
                    };

                    let local = this.getLocal(resolvable.user);
                    ctx.voiceMap.delete(resolvable);
                    ctx.update(resolvable.guild, resolvable.user, Date.now() - local);
                });
            });
    }

    private existsLocal(user: string) {
        return Array
            .from(this.voiceMap)
            .some(([k]) => k.user === user);
    }

    private getLocal(user: string) {
        return Array
            .from(this.voiceMap)
            .find(([k]) => k.user === user)[1];
    }

    private getStats(guild: string, user: string, or?: number) {
        return this.store.get(guild)[user] || or;
    }

    private determineChange(a: VoiceState, b: VoiceState): VoiceStateChange {
        if (!a.channel && b.channel) return VoiceStateChange.CONNECT;
        if (a.channel && !b.channel) return VoiceStateChange.DISCONNECT;
        if (!a.deaf && b.deaf)       return VoiceStateChange.DEAF;
        if (!a.mute && b.mute)       return VoiceStateChange.MUTE;
        if (a.deaf && !b.deaf)       return VoiceStateChange.UNDEAF;
        if (a.mute && !b.mute)       return VoiceStateChange.UNMUTE;

        return VoiceStateChange.UNKNOWN;
    }

}

export enum VoiceStateChange {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    DEAF = 'deaf',
    MUTE = 'mute',
    UNDEAF = 'undeaf',
    UNMUTE = 'unmute',
    UNKNOWN = 'unknown'
}

type VoiceMapResolvable = {
    user: string;
    guild: string;
}

export type PartialVoiceBoardRecord = {
    user: string;
    time: number;   
}

export type VoiceBoardRecord = {
    user: string;
    time: number;
    position: number;   
}