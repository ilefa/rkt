import ytdl from 'ytdl-core-discord';

import { Message, User } from 'discord.js';
import { metadata } from 'youtube-metadata-from-url';
import { Command, CommandReturn } from '../../command';
import {
    bold,
    CUSTOM_PERMS,
    EmbedIconType,
    emboss,
    generateEmbed,
    generateSimpleEmbed,
    generateSimpleEmbedWithImage,
    link,
    URL_REGEX
} from '../../../../../util';

type MetaResponse = {
    provider_name?: string;
    provider_url?: string;
    thumbnail_url: string;
    thumbnail_width?: number;
    thumbnail_height?: number;
    author_name: string;
    author_url: string;
    version?: string;
    title: string;
    type?: string;
    html?: string;
    width?: number;
    height?: number;
}

export default class YtPlayCommand extends Command {

    constructor() {
        super('ytplay', `Invalid usage: ${emboss('.ytplay <url> [vol]')}`, null, [], CUSTOM_PERMS.SUPERMAN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            return CommandReturn.HELP_MENU;
        }

        if (!URL_REGEX.test(args[0])) {
            message.reply(generateSimpleEmbed('Audio Player', EmbedIconType.AUDIO, `Invalid URL: ${emboss(args[0])}`));
            return CommandReturn.EXIT;
        }

        if (!args[0].includes('youtube.com') && !args[0].includes('youtu.be')) {
            message.reply(generateSimpleEmbed('Audio Player', EmbedIconType.AUDIO, `Provided URL is not a YouTube URL.`));
            return CommandReturn.EXIT;
        }

        let vc = message.member.voice.channel;
        if (!vc) {
            message.reply(generateSimpleEmbed('Audio Player', EmbedIconType.AUDIO, 'You must be in a voice channel to do this.'));
            return CommandReturn.EXIT;
        }

        let permissions = vc.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            message.reply(generateSimpleEmbed('Audio Player', EmbedIconType.AUDIO, `Insufficient privileges to join ${emboss(vc.name)}!`));
            return CommandReturn.EXIT;
        }

        let cur = message.guild.voice;
        if (cur && cur.speaking) {
            message.reply(generateSimpleEmbed('Audio Player', EmbedIconType.AUDIO, `StonksBot is already speaking in ${bold(message.guild.voice.channel.name)}!`));
            return CommandReturn.EXIT;
        }

        let vol = parseInt(args[1] || '') || 1;
        if (vol < 0 || vol > 1) {
            message.reply(generateSimpleEmbed('Audio Player', EmbedIconType.AUDIO, `Volume parameter expects a non-zero positive integer between zero and one.`));
            return CommandReturn.EXIT;
        }

        let meta = await metadata(args[0]) as MetaResponse;
        if (!meta) {
            meta = {
                title: 'Unavailable',
                author_name: 'Unknown',
                author_url: '#',
                thumbnail_url: 'https://i.ytimg.com/vi/1Gj1NvMJBOM/maxresdefault.jpg'
            }
        }

        vc
            .join()
            .then(async connection => {
                message.reply(generateSimpleEmbedWithImage('Audio Player', EmbedIconType.AUDIO,
                    `Now playing ${link(meta.title, args[0])} by ${link(meta.author_name, meta.author_url)}.`, meta.thumbnail_url));

                let dispatcher = connection.play(await ytdl(args[0]), {
                    volume: vol,
                    type: 'opus'
                });

                dispatcher.on('finish', () => vc.leave());
            }).catch(err => {
                message.reply(generateEmbed('Audio Player', EmbedIconType.AUDIO, 'An error occurred while playing playing audio.', [
                    {
                        name: 'Stack',
                        value: err,
                        inline: false
                    }
                ]));
            });
    }

}