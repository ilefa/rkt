import env from '../../../../../../env.json';

import ensure from 'validator';
import AudioManager, { PlatformType } from '../../../audio';

import ytdl from 'ytdl-core-discord';
import ytsearch from 'youtube-search-api';

import { Readable } from 'stream';
import { EmbedIconType } from '../../../../util';
import { Message, Permissions, User } from 'discord.js';
import { AudioQueueEntry, OriginType } from '../../../audio';

import {
    asMention,
    bold,
    Command,
    CommandReturn,
    emboss,
    getLatestTimeValue
} from '@ilefa/ivy';

const NEEDED_PERMS = [
    Permissions.FLAGS.SPEAK,
    Permissions.FLAGS.CONNECT
]

export class PlayCommand extends Command {

    constructor() {
        super('play', `Invalid usage: ${emboss('.play <url | keywords>')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            return CommandReturn.HELP_MENU;
        }

        let channel = message.member.voice.channel;
        if (!channel) {
            message.reply(this.embeds.build('Audio Player', EmbedIconType.AUDIO, 'You must be connected to a voice channel to do this.', [], message));
            return CommandReturn.EXIT;
        }

        if (NEEDED_PERMS
                .map(perm => message
                        .member
                        .permissionsIn(channel).has(perm))
                .some(state => !state)) {
            message.reply(this.embeds.build('Audio Player', EmbedIconType.AUDIO, `You don't have permission to play audio in ${emboss(channel.name)}!`, [], message));
            return CommandReturn.EXIT;
        }

        if (args.length === 1 && ensure.isURL(args[0])) {
            let origin = this.determineOrigin(args[0]);
            if (!origin) {
                message.reply(this.embeds.build('Audio Player', EmbedIconType.AUDIO, 'Sorry, I can\'t play audio from that URL.', [
                    {
                        name: 'Supported Origins',
                        value: 'YouTube, SoundCloud, Spotify'
                    }
                ], message));
                return CommandReturn.EXIT;
            }

            if (origin === OriginType.YOUTUBE.toString() || origin === OriginType.YOUTUBE_SHORT.toString()) {
                let cause = '';
                let dl: Readable = await ytdl(args[0]).catch(err => {
                    cause = err?.message;
    
                    if (err.message && err.message.startsWith('No video id found')) {
                        cause = 'Audio source not found';
                    }
    
                    return null;
                });

                if (!dl) {
                    message.reply(this.embeds.build('Audio Player', EmbedIconType.AUDIO, `An error occurred while retrieving data from the web.`, [
                        {
                            name: 'URL',
                            value: args[0],
                            inline: false
                        },
                        {
                            name: 'Error',
                            value: cause || 'Unknown Cause',
                            inline: false
                        }
                    ], message));
                    return CommandReturn.EXIT;
                }

                let data = await ytdl.getBasicInfo(args[0]);
                let entry: AudioQueueEntry = {
                    meta: {
                        url: args[0],
                        author: data.videoDetails.author.name,
                        authorLink: data.videoDetails.author.channel_url,
                        title: data.videoDetails.title,
                        image: data.videoDetails.thumbnails[0].url || 'https://i.ytimg.com/vi/1Gj1NvMJBOM/maxresdefault.jpg',
                        duration: parseInt(data.videoDetails.lengthSeconds) * 1000,
                        platform: PlatformType[
                            Object
                                .entries(OriginType)
                                .filter(arr => arr.includes(origin))[0][0]
                            ] ?? 'Unknown'
                    },
                    requester: user.id,
                    startTime: null,
                    source: dl
                }

                message.channel.send(`${asMention(user)} queued ${bold(entry.meta.title)} by ${bold(entry.meta.author)} (${getLatestTimeValue(entry.meta.duration)})`)

                let audioManager = this.engine.moduleManager.require<AudioManager>('Audio');
                audioManager.enqueue(channel, entry,
                    ent => message.channel.send(`:musical_note: Now playing ${bold(ent.meta.title)} by ${bold(ent.meta.author)} [${asMention(ent.requester)}] (${getLatestTimeValue(ent.meta.duration)})`),
                    err => message.channel.send(`:x: Something went wrong while playing audio:\n${emboss(err)}`));

                return CommandReturn.EXIT;
            }

            // TODO: SoundCloud download using [soundcloud-downloader]
            // TODO: Spotify download using [node-spotify-youtube-downloader] and converting Spotify URLs to Spotify URIs

            return CommandReturn.EXIT;
        }

        // Keyword searching, which will search all three platforms and use a sort of embed + reaction selector

        return CommandReturn.HELP_MENU;
    }

    private determineOrigin = (raw: string) => {
        let url = raw.split(/^http(?:s){0,1}:\/{2}/)[1]?.split(/\//)[0];

        if (url.startsWith('www.'))
            url = url.split('www.')[1]

        for (let ent of Object.keys(OriginType)) {
            if (OriginType[ent] === url)
                return OriginType[ent];
        }
    }

}