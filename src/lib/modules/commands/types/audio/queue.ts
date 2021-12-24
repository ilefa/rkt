import AudioManager from '../../../audio';

import { EmbedIconType } from '../../../../util';
import { AudioQueueEntry } from '../../../audio';
import { Message, Permissions, TextChannel, User } from 'discord.js';

import {
    asMention,
    bold,
    Command,
    CommandReturn,
    cond,
    emboss,
    getLatestTimeValue,
    join,
    link,
    numberEnding,
    PageContent,
    PaginatedEmbed,
    sum
} from '@ilefa/ivy';

export class QueueCommand extends Command {

    constructor() {
        super('queue', `Invalid usage: ${emboss('.queue [clear]')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 2)
            return CommandReturn.HELP_MENU;
            
        if (args.length > 0 && args[0] !== 'clear')
            return CommandReturn.HELP_MENU;

        let audioManager = this.engine.moduleManager.require<AudioManager>('Audio');
        if (args.length >= 1 && args[0] === 'clear') {
            if (!this.engine.has(user, Permissions.FLAGS.BAN_MEMBERS, message.guild)) {
                message.reply(this.engine.opts.commandMessages.permission(user, message, this));
                return CommandReturn.EXIT;
            }

            audioManager.clear(message.guild,
                amt => message.channel.send(`:wastebasket: ${asMention(user)} cleared ${bold(`${amt} song${numberEnding(amt)}`)} from the queue.`),
                err => message.reply(`:x: ${err}`));
            return CommandReturn.EXIT;
        }

        let queue = audioManager.queue.get(message.guild);
        if (!queue || audioManager.queue.length(message.guild) === 0) {
            message.channel.send(':open_file_folder: There are no songs in the queue.');
            return CommandReturn.EXIT;
        }

        let transform = (pageItems: AudioQueueEntry[]): PageContent => {
            return {
                description: `${bold(queue.length)} song${numberEnding(queue.length)} ${cond(queue.length === 1, 'is', 'are')} currently in queue. (${getLatestTimeValue(sum(queue, ent => ent.meta.duration))} collectively)\n\n`
                            + join(pageItems, '\n', entry => `${bold(entry.position + '.')} [${asMention(entry.requester)}] ${link(entry.meta.title, entry.meta.url)} (${getLatestTimeValue(entry.meta.duration)})`),
                fields: []
            }
        }
        
        PaginatedEmbed.ofItems(this.engine, message.channel as TextChannel,
            user, `${message.guild.name} Queue`, EmbedIconType.AUDIO,
            audioManager.queue.get(message.guild), 10, transform);

        return CommandReturn.EXIT;
    }

}