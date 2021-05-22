import { Readable } from 'stream';
import { GuildResolvable, VoiceChannel } from 'discord.js';
import { DEFAULT_STREAM_OPTS, GuildQueue, Module, resolvableToId } from '@ilefa/ivy';

export type AudioQueueEntry = {
    meta: {
        url: string;
        title: string;
        author: string;
        authorLink?: string;
        image?: string;
        duration: number;
        platform: string;
    }
    requester: string;
    startTime: number;
    source: Readable;
}

export enum OriginType {
    YOUTUBE = 'youtube.com',
    YOUTUBE_SHORT = 'youtu.be',
    SOUNDCLOUD = 'soundcloud.com',
    SPOTIFY = 'open.spotify.com'
}

export enum PlatformType {
    YOUTUBE = '<:youtube:845571428896342017> YouTube',
    YOUTUBE_SHORT = '<:youtube:845571428896342017> YouTube',
    SOUNDCLOUD = '<:soundcloud:845571429281562654> SoundCloud',
    SPOTIFY = '<:spotify:845571429973360640> Spotify'
}

export default class AudioManager extends Module {

    queue: GuildQueue<AudioQueueEntry>;

    constructor() {
        super('Audio');
    }

    start() {
        this.queue = new GuildQueue();
    }

    end = () => this.client.voice.connections.forEach(connection => connection.disconnect());

    enqueue = (channel: VoiceChannel, entry: AudioQueueEntry, onNext: (entry: AudioQueueEntry) => void, onError: (error: Error) => void) => {
        this.queue.push(channel.guild, entry);
        let connection = this.client.voice.connections.find(connection => connection.channel.id === channel.id);
        if (!connection || (connection && !connection.speaking)) {
            this.stream(this, channel, entry, onNext, onError);
        }
    }

    skip = (guild: GuildResolvable, onSkip: (entry: AudioQueueEntry) => void, onError: (err: string) => void) => {
        if (!this.queue.get(guild))
            return onError('There are no songs in the queue.');

        let connection = this.client.voice.connections.find(conn => conn.channel.guild.id === resolvableToId(guild));
        if (!connection)
            return onError('No audio is currently playing.');

        // emit a fake finish event to trick player into skipping
        onSkip(this.queue.peek(guild));
        connection.dispatcher.emit('finish');
    }
    
    playPause = (guild: GuildResolvable, onState: (state: boolean, entry: AudioQueueEntry) => void, onError: (err: string) => void) => {
        if (!this.queue.get(guild))
            return onError('There are no songs in the queue.');

        let connection = this.client.voice.connections.find(conn => conn.channel.guild.id === resolvableToId(guild));
        if (!connection)
            return onError('No audio is currently playing.');

        let playing = !connection.dispatcher.paused;

        onState(!playing, this.queue.peek(guild));
        playing
            ? connection.dispatcher.pause()
            : connection.dispatcher.resume();
    }

    private stream = (
            ctx: this,
            channel: VoiceChannel,
            entry: AudioQueueEntry,
            onNext: (entry: AudioQueueEntry) => void,
            onError: (error: Error) => void) => {
        onNext(entry);
        
        let conn = this.client.voice.connections.find(conn => conn.channel.id === channel.id);
        if (!conn) {
            return channel
                .join()
                .then(async connection => {
                    let dispatcher = connection.play(entry.source, DEFAULT_STREAM_OPTS);
                    entry.startTime = Date.now();

                    dispatcher.on('finish', () => {
                        // channel is empty after the music finishes, so let's disconnect
                        if (connection !== null && connection.channel.members.size <= 1)
                            return connection.disconnect();

                        ctx.queue.pop(channel.guild);

                        let next = ctx.queue.peek(channel.guild);
                        if (!next) return connection.disconnect();

                        this.stream(ctx, channel, next, onNext, onError);
                    });

                    dispatcher.on('error', err => onError(err));
                })
                .catch(err => onError(err));
        }

        let dispatcher = conn.play(entry.source, DEFAULT_STREAM_OPTS);
        
        dispatcher.on('finish', () => {
            // channel is empty after the music finishes, so let's disconnect
            if (conn !== null && conn.channel.members.size <= 1)
                return conn.disconnect();

            ctx.queue.pop(channel.guild);

            let next = ctx.queue.peek(channel.guild);
            if (!next) return conn.disconnect();

            this.stream(ctx, channel, next, onNext, onError);
        });

        dispatcher.on('error', err => onError(err));
    }

}