import AudioManager from '../../../audio';

import ytdl from 'ytdl-core-discord';
import ytsearch from 'youtube-search-api';

import { videoInfo } from 'ytdl-core';
import { PlatformType } from '../../../audio';
import { EmbedIconType } from '../../../../util';
import { AudioQueueEntry, OriginType } from '../../../audio';
import { Playlist, scrapePlaylist } from 'youtube-playlist-scraper';
import { Message, Permissions, TextChannel, User, VoiceChannel } from 'discord.js';

import {
    bold,
    Command,
    CommandReturn,
    emboss,
    endLoader,
    getLatestTimeValue,
    isURL,
    link,
    LOADER,
    mentionChannel,
    numberEnding,
    PageContent,
    PaginatedEmbed,
    startLoader,
    sum
} from '@ilefa/ivy';

const YOUTUBE_EMOTE = '<:youtube:845571428896342017>';
const YOUTUBE_PLAYLIST_MAX = 51;

const NEEDED_PERMS = [
    Permissions.FLAGS.SPEAK,
    Permissions.FLAGS.CONNECT
]

type YtSearchPaginatorObject = {
    position: number;
    response: videoInfo;
}

type YtSearchResponse = {
    id: string;
    type: string;
    thumbnail: {
        thumbnails: [
            {
                url: string;
                width: number;
                height: number;
            }
        ]
    };
    title: string;
    length: {
        accessibility: any;
        simpleText: string;
    };
    isLive: boolean;
}

export class PlayCommand extends Command {

    constructor() {
        super('play', `Invalid usage: ${emboss('.play <url | keywords>')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
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

        if (args.length === 1 && isURL(args[0])) {
            let origin = this.determineOrigin(args[0]);
            if (!origin) {
                message.reply(this.embeds.build('Audio Player', EmbedIconType.AUDIO, 'Sorry, I can\'t play audio from that URL.', [
                    {
                        name: 'Supported Origins',
                        value: emboss('youtube.com, youtu.be') // only these two for the mean time
                    }
                ], message));
                return CommandReturn.EXIT;
            }

            if (origin === OriginType.YOUTUBE.toString() || origin === OriginType.YOUTUBE_SHORT.toString()) {
                if (args[0].includes('playlist?list=')) {
                    this.enqueuePlaylist(user, message, channel, args[0]);
                    return CommandReturn.EXIT;
                }

                this.runEnqueue(user, message, channel, args[0], this.originToPlatform(origin));
                return CommandReturn.EXIT;
            }

            return CommandReturn.EXIT;
        }

        let search = args.join(' ');
        let res: YtSearchResponse[] = (await ytsearch.GetListByKeyword(search)).items;
        let data: videoInfo[] = await Promise
            .all(res
                .map(ent => new Promise((resolve, _reject) => resolve(ytdl.getBasicInfo('https://youtube.com/watch?v=' + ent.id)))
                .catch(_ => undefined)))
            .catch(err => {
                if (err.message === 'Video unavailable')
                    message.channel.send(`${YOUTUBE_EMOTE} Hmm, YouTube is reporting that one or more videos are unavailable for your query, ${emboss(search)}.`);
                else
                    message.channel.send(`:x: Something went wrong while completing your request:\n` 
                                       + `:x: ${emboss(err.message)}`);
                return null;
            });
                    
        let entries = data?.filter(ent => !!ent);
        if (!entries) {
            message.channel.send(`${YOUTUBE_EMOTE} No matches for ${emboss(search)}!`);
            return CommandReturn.EXIT;
        }

        let pageObjects: YtSearchPaginatorObject[] = entries.map((ent, i) => {
            return {
                position: i + 1,
                response: ent
            }
        });

        let transform = (pageItems: YtSearchPaginatorObject[]): PageContent => {
            return {
                description: `Select audio by typing ${bold(`1-${entries.length}`)} in ${mentionChannel(message.channel.id)}.\n\n:mag_right: Results for ${emboss(search)}:\n`
                    + pageItems.map(({ response, position }) => `${bold(`${position}.`)} ${link(response.videoDetails.title, response.videoDetails.video_url)} (${getLatestTimeValue(parseInt(response.videoDetails.lengthSeconds) * 1000)}) by ${link(response.videoDetails.author.name, response.videoDetails.author.channel_url)}.`).join('\n'),
                fields: []
            }
        }
        
        let selectionEmbed = PaginatedEmbed.ofItems(this.engine, message.channel as TextChannel,
            user, `Audio Search`, EmbedIconType.AUDIO,
            pageObjects, 6, transform);

        message.channel.awaitMessages((message: Message) => message && message.author.id === user.id,
            {
                max: 1,
                time: 30000,
                errors: ['time'] 
            })
            .then(async _m => {
                let msg = _m.first();
                let choice = parseInt(msg.content);
                if (isNaN(choice)) {
                    msg.reply(`:x: Non-Numeric Selection: ${emboss(choice)}`);
                    return;
                }

                let valid = Array.from(Array(data.length).slice(1).keys());
                if (!valid.includes(choice)) {
                    msg.reply(`:x: Invalid Selection: ${emboss(choice)}`);
                    return;
                }

                let selected = data[choice - 1];
                if (!selected) {
                    msg.reply(`:x: Something went wrong while processing your request.`);
                    return;
                }

                this.runEnqueue(user, message, channel, selected.videoDetails.video_url, PlatformType.YOUTUBE, () => {
                    msg.delete();
                    selectionEmbed.collector.stop();
                    selectionEmbed.message.delete();
                });
            })
            .catch(() => {
                message.reply(`:hourglass: Media selection timed out.`);
                selectionEmbed.collector.stop();
                selectionEmbed.message.delete();
            });

        return CommandReturn.EXIT;
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

    private originToPlatform = (origin: string) => PlatformType[
        Object
            .entries(OriginType)
            .filter(arr => arr.includes(origin))[0][0]
        ] ?? 'Unknown'

    private runEnqueue = async (user: User, message: Message, channel: VoiceChannel, url: string, platform: PlatformType, onQueue?: () => void) => {
        let data = await ytdl.getBasicInfo(url);
        let entry: AudioQueueEntry = {
            meta: {
                url,
                author: data.videoDetails.author.name,
                authorLink: data.videoDetails.author.channel_url,
                title: data.videoDetails.title,
                image: data.videoDetails.thumbnails[0].url || 'https://i.ytimg.com/vi/1Gj1NvMJBOM/maxresdefault.jpg',
                duration: parseInt(data.videoDetails.lengthSeconds) * 1000,
                rating: {
                    up: data.videoDetails.likes,
                    down: data.videoDetails.dislikes
                },
                views: parseInt(data.videoDetails.viewCount),
                date: new Date(data.videoDetails.uploadDate).getTime(),
                platform,
            },
            loop: false,
            position: null,
            requester: user.id,
            startTime: null,
            source: null
        }

        if (onQueue) onQueue();

        let audioManager = this.engine.moduleManager.require<AudioManager>('Audio');
        audioManager.enqueue(channel, entry,
            (ent, loop) => {
                if (loop) message.channel.send(`:notes: Looping ${bold(ent.meta.title)} by ${bold(ent.meta.author)} (${getLatestTimeValue(ent.meta.duration)})\n:notes: Type ${emboss('.loop')} to toggle looping.`)
                else message.channel.send(`:notes: Now playing ${bold(ent.meta.title)} by ${bold(ent.meta.author)} (${getLatestTimeValue(ent.meta.duration)})`)
            },
            ent => message.channel.send(`${bold(`[#${ent.position}]`)} Queued ${bold(entry.meta.title)} by ${bold(entry.meta.author)} (${getLatestTimeValue(entry.meta.duration)})`),
            err => message.channel.send(`:x: ${err}`));
    }

    private enqueuePlaylist = async (user: User, message: Message, channel: VoiceChannel, url: string) => {
        let { title, playlist }: Playlist = await scrapePlaylist(url.split('?list=')[1]);
        let urls = playlist.map(video => 'https://youtube.com/watch?v=' + video.id);
        let loader = await startLoader(message, LOADER, 'Fetching assets, this will take a moment..');
        
        if (urls.length > YOUTUBE_PLAYLIST_MAX)
            urls = urls.slice(0, YOUTUBE_PLAYLIST_MAX - 1);

        let entries = await Promise.all(urls.map(async url => await this.makeQueueEntry(user, url)));
        if (entries.some(ent => !ent))
            entries = entries.filter(ent => !!ent);

        endLoader(loader);

        let audioManager = this.engine.moduleManager.require<AudioManager>('Audio');
        audioManager.enqueueBulk(channel, entries,
            (ent, loop) => {
                if (loop) message.channel.send(`:notes: Looping ${bold(ent.meta.title)} by ${bold(ent.meta.author)} (${getLatestTimeValue(ent.meta.duration)})\n:notes: Type ${emboss('.loop')} to toggle looping.`)
                else message.channel.send(`:notes: Now playing ${bold(ent.meta.title)} by ${bold(ent.meta.author)} (${getLatestTimeValue(ent.meta.duration)})`)
            },
            ent => message.channel.send(`:books: Queued ${bold(`${ent.length} song${numberEnding(ent.length)}`)} from ${bold(title)} (${getLatestTimeValue(sum(entries, entry => entry.meta.duration))})`),
            err => message.channel.send(`:x: ${err}`));
    }

    private makeQueueEntry = async (user: User, url: string): Promise<AudioQueueEntry> => {
        let data = await ytdl.getBasicInfo(url);
        if (!data) return null;

        return {
            meta: {
                url,
                author: data.videoDetails.author.name,
                authorLink: data.videoDetails.author.channel_url,
                title: data.videoDetails.title,
                image: data.videoDetails.thumbnails[0].url || 'https://i.ytimg.com/vi/1Gj1NvMJBOM/maxresdefault.jpg',
                duration: parseInt(data.videoDetails.lengthSeconds) * 1000,
                rating: {
                    up: data.videoDetails.likes,
                    down: data.videoDetails.dislikes
                },
                views: parseInt(data.videoDetails.viewCount),
                date: new Date(data.videoDetails.uploadDate).getTime(),
                platform: PlatformType.YOUTUBE,
            },
            loop: false,
            position: null,
            requester: user.id,
            startTime: null,
            source: null
        }
    }

}