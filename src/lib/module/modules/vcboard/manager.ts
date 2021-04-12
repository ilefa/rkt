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
    voiceMap: VoiceMapResolvable[];

    constructor(client: Client) {
        super('Voice Board');
        this.client = client;
    }

    async start() {
        this.jobs = [];
        this.voiceMap = [];
        this.store = initFlatFileStore(DB_PATH);

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
                .filter(members => members.length > 0)
                .forEach(memberList => {
                    memberList.forEach(member => {
                        let resolvable = {
                            guild: guild.id,
                            user: member.id,
                            time: Date.now()
                        };

                        ctx.voiceMap.push(resolvable);
                    });
                });
        });

        Logger.info('Voice Board', `${this.voiceMap.length} passive records added.`);
        
        this.store.sync();
        this.client.on('voiceStateUpdate', async (old, current) => {
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
                user: current.member.user.id,
                time: Date.now(),
            };

            switch (change.toLowerCase()) {
                case 'connect':
                case 'undeaf':
                case 'unmute':
                    if (this.existsLocal(resolvable.user)) {
                        let local = this.getLocal(resolvable.user);
                        ctx.update(resolvable.guild, resolvable.user, Date.now() - local.time);
                        this.removeLocal(resolvable.user);
                    }

                    if (this.isAlone(current)) {
                        break;
                    }

                    ctx.voiceMap.push(resolvable);
                    break;
                case 'disconnect':
                case 'deaf':
                case 'mute':
                    if (this.isAlone(current)) {
                        let alone = await this.whoIsAlone(current);
                        if (alone) {
                            if (!this.existsLocal(alone)) {
                                break;
                            }
        
                            let local = this.getLocal(alone);
                            this.removeLocal(alone);
        
                            ctx.update(resolvable.guild, alone, Date.now() - local.time);
                        }
                    }

                    if (!this.existsLocal(resolvable.user)) {
                        break;
                    }
                    
                    let local = this.getLocal(resolvable.user);
                    this.removeLocal(resolvable.user);

                    ctx.update(resolvable.guild, resolvable.user, Date.now() - local.time);
                    break;
                default:
                    break;
            }
        });

        Logger.info('Voice Board', `Enabled in ${timeDiff(start)}ms.`);
    }

    end() {
        let ctx = this;
        let size = this.voiceMap.length;

        this.jobs.forEach(job => job.cancel());
        this.voiceMap.forEach(resolvable => {
            ctx.update(resolvable.guild, resolvable.user, Date.now() - resolvable.time);
            ctx.voiceMap = ctx
                .voiceMap
                .filter(ent => ent.user !== resolvable.user);       
        });

        ctx.voiceMap = [];
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
                time: data[user]
            }));

        unsorted
            .sort((a, b) => b.time - a.time)
            .forEach((record, i) => records.push({
                user: record.user,
                time: record.time,
                position: i + 1
            }));

        if (limit !== -1) {
            records = records.slice(0, Math.min(unsorted.length, limit));
        }

        return records;
    }

    async reset(guild: string, user: string): Promise<boolean> {
        let data = this.store.get(guild);
        let record = this.getStats(guild, user, null);
        if (!record) {
            return false;
        }

        data[user] = 0;

        this.store.set(guild, data);
        this.store.sync();
        return true;
    }

    async resetAll(guild: string): Promise<boolean> {
        let data = this.store.get(guild);
        if (!data) {
            return false;
        }

        data = {};

        this.store.set(guild, data);
        this.store.sync();
        return true;
    }

    private async isAlone(state: VoiceState) {
        let channel = state.channel;
        if (!channel || channel.members.size !== 0) {
            return false;
        }

        return true;
    }

    private async whoIsAlone(state: VoiceState) {
        let channel = state.channel;
        if (!this.isAlone(state)
            || !channel
            || channel.members.size === 0) {
                return null;
        }

        return channel.members.first().id;
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
            .filter(members => members.length > 0)
            .forEach(memberList => {
                memberList.forEach(member => {
                    let resolvable = {
                        guild: guild.id,
                        user: member.id,
                        time: Date.now()
                    };

                    let local = this.getLocal(resolvable.user);
                    if (!local) {
                        return;
                    }

                    ctx.update(resolvable.guild, resolvable.user, Date.now() - local.time);
                    this.removeLocal(resolvable.user);

                    ctx.voiceMap.push(resolvable);
                });
            });
    }

    private existsLocal(user: string): boolean {
        return this.voiceMap.some(resolvable => resolvable.user === user);
    }

    private getLocal(user: string): VoiceMapResolvable {
        return this.voiceMap.find(resolvable => resolvable.user === user);
    }

    private removeLocal(user: string) {
        this.voiceMap = this
            .voiceMap
            .filter(resolvable => resolvable.user !== user);
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
    time: number;
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