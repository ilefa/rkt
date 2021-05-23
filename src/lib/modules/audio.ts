import ytdl from 'ytdl-core-discord';

import { Readable } from 'stream';
import { Guild, GuildResolvable, VoiceChannel } from 'discord.js';

import {
    bold,
    DEFAULT_STREAM_OPTS,
    emboss,
    GuildQueue,
    Module,
    numberEnding
} from '@ilefa/ivy';

export type AudioQueueEntry = {
    meta: {
        url: string;
        title: string;
        author: string;
        authorLink?: string;
        image?: string;
        rating?: {
            up: number;
            down: number;
        };
        views?: number;
        date?: number;
        duration: number;
        platform: string;
    }
    loop: boolean;
    position: number;
    requester: string;
    startTime: number;
    source: Readable;
}

export enum OriginType {
    YOUTUBE = 'youtube.com',
    YOUTUBE_SHORT = 'youtu.be',
    // SOUNDCLOUD = 'soundcloud.com',
    // SPOTIFY = 'open.spotify.com'
}

export enum PlatformType {
    YOUTUBE = '<:youtube:845571428896342017> YouTube',
    YOUTUBE_SHORT = '<:youtube:845571428896342017> YouTube',
    // SOUNDCLOUD = '<:soundcloud:845571429281562654> SoundCloud',
    // SPOTIFY = '<:spotify:845571429973360640> Spotify'
}

export default class AudioManager extends Module {

    queue: GuildQueue<AudioQueueEntry>;

    constructor() {
        super('Audio');
    }

    start = () => {
        this.queue = new GuildQueue();
        this.manager.engine.logger.info('Audio', 'Audio Manager activated.');
    }

    end = () => {
        let connections = this.client.voice.connections.array();
        let amount = connections.length;
        connections.forEach(connection => connection.disconnect());
        
        this.manager.engine.logger.info('Audio', `${amount} connection${numberEnding(amount)} terminated.`);
    }

    enqueue = (
        channel: VoiceChannel,
        entry: AudioQueueEntry,
        onNext: (entry: AudioQueueEntry, loop: boolean) => void,
        onQueue: (entry: AudioQueueEntry) => void,
        onError: (error: string) => void
    ) => {
        let queue = this.queue.get(channel.guild);
        let position = 1;
        if (queue && queue.length)
            position = queue.length + 1

        entry.position = position;

        this.queue.push(channel.guild, entry);
        let connection = this.client.voice.connections.find(conn => conn.channel.id === channel.id);
        if (!connection || (connection && !connection.speaking))
            this.stream(this, channel, entry, onNext, onError);
        else onQueue(entry);
    }

    enqueueBulk = (
        channel: VoiceChannel,
        entries: AudioQueueEntry[],
        onNext: (entry: AudioQueueEntry, loop: boolean) => void,
        onComplete: (entries: AudioQueueEntry[]) => void,
        onError: (error: string) => void
    ) => {
        let queue = this.queue.get(channel.guild);
        let counter = 1;
        if (queue && queue.length)
            counter = queue.length;

        let i = 0;
        for (let ent of entries) {
            ent.position = counter + i;
            i++;
            this.queue.push(channel.guild, ent);
        }

        onComplete(entries);

        let connection = this.client.voice.connections.find(conn => conn.channel.id === channel.id);
        if (!connection || (connection && !connection.speaking))
            this.stream(this, channel, entries[0], onNext, onError);
    }

    clear = (
        guild: Guild,
        onClear: (amt: number) => void,
        onError: (err: string) => void
    ) => {
        if (!this.queue.get(guild))
            return onError('There are no songs in the queue.');

        let queue = this.queue.get(guild);
        let cur = queue[0];
        let len = queue.length;
        this.queue.clear(guild);
        this.queue.set(guild, [cur]);

        onClear(len);

        let connection = this.client.voice.connections.find(conn => conn.channel.guild.id === guild.id);
        if (connection) connection.dispatcher.emit('finish');
    }

    skip = (
        guild: Guild,
        amount: number,
        onSkip: (entry: AudioQueueEntry, amount: number) => void,
        onError: (err: string) => void
    ) => {
        if (!this.queue.get(guild))
            return onError('There are no songs in the queue.');

        let queue = this.queue.get(guild);
        if (amount === 0)
            return onError('Skip amount must be non-zero.');

        if (amount > queue.length)
            return onError('Can\'t skip more songs than currently exist in queue.');

        let current = queue[0];
        if (current.loop)
            return onError(`Can\'t skip looped song, use ${emboss('.loop')} to disable looping.`);

        let connection = this.client.voice.connections.find(conn => conn.channel.guild.id === guild.id);
        if (!connection) return onError('No audio is currently playing.');

        onSkip(current, amount);
        
        // emit a fake finish event to trick player into skipping
        this.queue.set(guild, queue.slice(amount - 1))
        connection.dispatcher.emit('finish');
    }

    shuffle = (
        guild: Guild,
        interrupt: boolean,
        onShuffle: () => void,
        onError: (err: string) => void
    ) => {
        let queue = this.queue.get(guild);
        if (!queue)
            return onError('There are no songs in the queue.');

        if (queue.length === 1)
            return onError('Can\'t shuffle the queue when only one song is present.');

        let connection = this.client.voice.connections.find(conn => conn.channel.guild.id === guild.id);
        if (!connection) return onError('No audio is currently playing.');

        let current = queue[0];
        if (current.loop)
            return onError(`Can\'t shuffle while looping a song, use ${emboss('.loop')} to disable looping.`);

        onShuffle();
        
        if (interrupt)
            connection.dispatcher.emit('finish');
        
        this.queue.shuffle(guild, true);
        this.normalizePositions(guild);
    }
    
    loop = (
        guild: Guild,
        onLoop: (ent: AudioQueueEntry, state: boolean) => void,
        onError: (err: string) => void
    ) => {
        let queue = this.queue.get(guild);
        if (!queue)
            return onError('There are no songs in the queue.');

        let connection = this.client.voice.connections.find(conn => conn.channel.guild.id === guild.id);
        if (!connection) return onError('No audio is currently playing.');

        let song = queue[0];
        song.loop = !song.loop;
        queue[0] = song;

        onLoop(song, song.loop);
        this.queue.set(guild, queue);
    }
    
    playPause = (
        guild: Guild,
        onState: (state: boolean, entry: AudioQueueEntry) => void,
        onError: (err: string) => void
    ) => {
        if (!this.queue.get(guild))
            return onError('No audio is currently playing.');

        let connection = this.client.voice.connections.find(conn => conn.channel.guild.id === guild.id);
        if (!connection) return onError('No audio is currently playing.');

        let playing = !connection.dispatcher.paused;

        onState(!playing, this.queue.peek(guild));
        playing
            ? connection.dispatcher.pause()
            : connection.dispatcher.resume();
    }

    private stream = async (
        ctx: this,
        channel: VoiceChannel,
        entry: AudioQueueEntry,
        onNext: (entry: AudioQueueEntry, loop: boolean) => void,
        onError: (error: string) => void
    ) => {
        onNext(entry, entry.loop);
        
        let cause = null;
        if (!entry.source)
            entry.source = await ytdl(entry.meta.url).catch((_: Error) => {
                cause = _.message;
                return null;
            });

        if (!entry.source) {
            if (cause && cause.startsWith('No video id found'))
                cause = 'No video was located at the given URL.';

            onError(`Something went wrong while loading ${bold(entry.meta.title)}.. (Skipping)\n` 
                  + `:warning: ${emboss(cause)}`);
            this.queue.pop(channel.guild)
            this.stream(ctx, channel, this.queue.peek(channel.guild), onNext, onError);
            return;
        }

        let conn = this.client.voice.connections.find(conn => conn.channel.id === channel.id);
        if (!conn) {
            return channel
                .join()
                .then(async connection => {
                    let dispatcher = connection.play(entry.source, DEFAULT_STREAM_OPTS);

                    dispatcher.on('finish', () => {
                        // channel is empty after the music finishes, so let's disconnect
                        if (connection !== null && connection.channel.members.size <= 1) {
                            this.queue.clear(channel.guild);
                            return connection.disconnect();
                        }

                        let cur = ctx.queue.peek(channel.guild);
                        if (cur.loop) {
                            cur.source = null;
                            return this.stream(ctx, channel, cur, onNext, onError);
                        }

                        ctx.queue.pop(channel.guild);

                        let next = ctx.queue.peek(channel.guild);
                        if (!next) return connection.disconnect();

                        next.position = 1;

                        this.normalizePositions(channel.guild);
                        this.stream(ctx, channel, next, onNext, onError);
                    });

                    dispatcher.on('start', () => {
                        entry.startTime = Date.now();
                        this.updateHead(channel.guild, entry);
                    });

                    dispatcher.on('error', err => onError(err.message));
                })
                .catch(err => onError(err));
        }

        let dispatcher = conn.play(entry.source, DEFAULT_STREAM_OPTS);

        dispatcher.on('finish', () => {
            // channel is empty after the music finishes, so let's disconnect
            if (conn !== null && conn.channel.members.size <= 1) {
                this.queue.clear(channel.guild);
                return conn.disconnect();
            }

            let cur = ctx.queue.peek(channel.guild);
            if (cur.loop) {
                cur.source = null;
                return this.stream(ctx, channel, cur, onNext, onError);
            }

            ctx.queue.pop(channel.guild);

            let next = ctx.queue.peek(channel.guild);
            if (!next) return conn.disconnect();

            next.position = 1;

            this.normalizePositions(channel.guild);
            this.stream(ctx, channel, next, onNext, onError);
        });

        dispatcher.on('start', () => {
            entry.startTime = Date.now();
            this.updateHead(channel.guild, entry);
        });

        dispatcher.on('error', err => onError(err.message));
    }

    private normalizePositions = (guild: GuildResolvable) => {
        let queue = this.queue.get(guild);
        if (!queue) return;

        queue = queue.map((ent, i) => {
            return {
                ...ent,
                position: i + 1
            }
        });

        this.queue.set(guild, queue);
    }

    private updateHead = (guild: GuildResolvable, entry: AudioQueueEntry) => this.queue.set(guild, [entry, ...this.queue.get(guild).slice(1)]);

}