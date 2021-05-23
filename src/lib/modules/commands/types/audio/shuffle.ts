import AudioManager from '../../../audio';

import { EmbedIconType } from '../../../../util';
import { Message, Permissions, User } from 'discord.js';
import { asMention, bold, Command, CommandReturn, emboss, getVoiceConnection } from '@ilefa/ivy';

export class ShuffleCommand extends Command {

    constructor() {
        super('shuffle', `Invalid usage: ${emboss('.shuffle [-i]')}`, null, [], Permissions.FLAGS.BAN_MEMBERS, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 1)
            return CommandReturn.HELP_MENU;
            
        let interrupt = args.length === 1 && args[0] === '-i';
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
        audioManager.shuffle(message.guild, interrupt,
            () => message.channel.send(`:twisted_rightwards_arrows: ${asMention(user)} shuffled the queue.`),
            err => message.reply(`:x: ${err}`));

        return CommandReturn.EXIT;
    }

}