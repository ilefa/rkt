import AudioManager from '../../../audio';

import { EmbedIconType } from '../../../../util';
import { Message, Permissions, User } from 'discord.js';
import { bold, Command, CommandReturn, emboss } from '@ilefa/ivy';

export class SkipCommand extends Command {

    constructor() {
        super('skip', `Invalid usage: ${emboss('.skip')}`, null, [], Permissions.FLAGS.BAN_MEMBERS, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0)
            return CommandReturn.HELP_MENU;
            
        let channel = message.member.voice.channel;
        if (!channel) {
            message.reply(this.embeds.build('Audio Player', EmbedIconType.AUDIO, 'You are not connected to a voice channel.', [], message));
            return CommandReturn.EXIT;
        }

        let connection = this.engine.client.voice.connections.find(conn => conn.channel.id === channel.id);
        if (!connection) {
            message.reply(this.embeds.build('Audio Player', EmbedIconType.AUDIO, `You are not in a channel where ${bold('rkt')} is connected.`, [], message));
            return CommandReturn.EXIT;
        }

        let audioManager = this.engine.moduleManager.require<AudioManager>('Audio');
        audioManager.skip(message.guild,
            ent => message.channel.send(`:fast_forward: Skipped ${bold(ent.meta.title)} by ${bold(ent.meta.author)}!`),
            err => message.reply(`:x: ${err}`));

        return CommandReturn.EXIT;
    }

}