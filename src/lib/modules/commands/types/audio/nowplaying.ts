import AudioManager from '../../../audio';

import { EmbedIconType } from '../../../../util';
import { Message, Permissions, User } from 'discord.js';

import {
    asMention,
    bold,
    Command,
    CommandReturn,
    emboss,
    getLatestTimeValue,
    link,
    time
} from '@ilefa/ivy';

export class NowPlayingCommand extends Command {

    constructor() {
        super('now', `Invalid usage: ${emboss('.now')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0)
            return CommandReturn.HELP_MENU;

        let audioManager = this.engine.moduleManager.require<AudioManager>('Audio');
        let queue = audioManager.queue.get(message.guild);
        if (!queue) {
            message.reply(this.embeds.build('Audio Player', EmbedIconType.AUDIO, 'Nothing is currently playing.', [], message));
            return CommandReturn.EXIT;
        }

        let cur = queue[0];
        let elapsed = Date.now() - cur.startTime;
        let amount = (elapsed / cur.meta.duration) * 20;
        let display = time(elapsed, 'm:ss') + ' / ' + time(cur.meta.duration, 'm:ss');

        message.reply(this.embeds.build('Audio Player', EmbedIconType.AUDIO, `Now Playing: ${link(cur.meta.title, cur.meta.url)} (${getLatestTimeValue(cur.meta.duration)})`, [
            {
                name: 'Creator',
                value: cur.meta.authorLink ? link(cur.meta.author, cur.meta.authorLink) : cur.meta.author,
                inline: true
            },
            {
                name: 'Platform',
                value: cur.meta.platform,
                inline: true
            },
            {
                name: 'Requested By',
                value: asMention(cur.requester),
                inline: true
            },
            {
                name: 'Elasped',
                value: `${bold(display)} [${'▰'.repeat(amount)}${'▱'.repeat(20 - amount)}]`,
                inline: false
            }
        ], message, null/*, cur.meta.image ?? null*/));

        return CommandReturn.EXIT;
    }

}