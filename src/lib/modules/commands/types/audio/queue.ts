import AudioManager from '../../../audio';

import { EmbedIconType } from '../../../../util';
import { AudioQueueEntry } from '../../../audio';
import { Message, Permissions, TextChannel, User } from 'discord.js';

import {
    asMention,
    Command,
    CommandReturn,
    emboss,
    getLatestTimeValue,
    join,
    link,
    PageContent,
    PaginatedEmbed
} from '@ilefa/ivy';

export class QueueCommand extends Command {

    constructor() {
        super('queue', `Invalid usage: ${emboss('.queue')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0)
            return CommandReturn.HELP_MENU;
            
        let audioManager = this.engine.moduleManager.require<AudioManager>('Audio');
        let transform = (pageItems: AudioQueueEntry[]): PageContent => {
            return {
                description: join(pageItems, '\n', entry => `[${asMention(entry.requester)}] ${link(entry.meta.title, entry.meta.url)} (${getLatestTimeValue(entry.meta.duration)})`),
                fields: []
            }
        }
        
        PaginatedEmbed.ofItems(this.engine, message.channel as TextChannel,
            user, `${message.guild.name} Queue`, EmbedIconType.AUDIO,
            audioManager.queue.get(message.guild), 10, transform);

        return CommandReturn.EXIT;
    }

}