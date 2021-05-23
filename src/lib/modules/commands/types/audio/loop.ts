import AudioManager from '../../../audio';

import { EmbedIconType } from '../../../../util';
import { Message, Permissions, User } from 'discord.js';
import { bold, Command, CommandReturn, emboss, getVoiceConnection } from '@ilefa/ivy';

export class LoopCommand extends Command {

    constructor() {
        super('loop', `Invalid usage: ${emboss('.loop')}`, null, [], Permissions.FLAGS.BAN_MEMBERS, false);
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
        audioManager.loop(message.guild,
            (ent, state) => message.channel.send(`${state ? ':repeat_one: Now' : ':repeat: No longer'} looping ${bold(ent.meta.title)} by ${bold(ent.meta.author)}.`),
            err => message.reply(`:x: ${err}`));

        return CommandReturn.EXIT;
    }

}