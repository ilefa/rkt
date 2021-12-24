import AudioManager from '../../../audio';

import { EmbedIconType } from '../../../../util';
import { Message, Permissions, User } from 'discord.js';
import { bold, Command, CommandReturn, emboss, getVoiceConnection } from '@ilefa/ivy';

export class PauseCommand extends Command {

    constructor() {
        super('pause', `Invalid usage: ${emboss('.pause')}`, null, [], Permissions.FLAGS.BAN_MEMBERS, false, false, ['DJ']);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0)
            return CommandReturn.HELP_MENU;
            
        let channel = message.member.voice.channel;
        if (!channel) {
            message.reply(this.embeds.build('Audio Player', EmbedIconType.AUDIO, 'You are not connected to a voice channel.', [], message));
            return CommandReturn.EXIT;
        }

        let connection = getVoiceConnection(this.engine.client, channel);
        if (!connection) {
            message.reply(this.embeds.build('Audio Player', EmbedIconType.AUDIO, `You are not in a channel where ${bold('rkt')} is connected.`, [], message));
            return CommandReturn.EXIT;
        }

        let audioManager = this.engine.moduleManager.require<AudioManager>('Audio');
        audioManager.playPause(message.guild,
            (state, ent) => message.channel.send(`:${state ? 'arrow_forward' : 'pause_button'}: ${state ? 'Resumed' : 'Paused'} ${bold(ent.meta.title)}.`),
            err => message.reply(`:x: ${err}`));

        return CommandReturn.EXIT;
    }

}