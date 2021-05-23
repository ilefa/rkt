import AudioManager from '../../../audio';

import { EmbedIconType } from '../../../../util';
import { Message, Permissions, User } from 'discord.js';
import { bold, Command, CommandReturn, emboss, getVoiceConnection } from '@ilefa/ivy';

export class SkipCommand extends Command {

    constructor() {
        super('skip', `Invalid usage: ${emboss('.skip [amount]')}`, null, [], Permissions.FLAGS.BAN_MEMBERS, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 1)
            return CommandReturn.HELP_MENU;
            
        let amount = args.length === 1 ? parseInt(args[0]) : 1;
        if (isNaN(amount)) {
            message.reply(this.embeds.build('Audio Player', EmbedIconType.AUDIO, `Invalid skip amount: ${emboss(args[0])}`, [], message));
            return CommandReturn.EXIT;
        }

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
        audioManager.skip(message.guild, amount,
            ent => message.channel.send(`:fast_forward: Skipped ${amount === 1 ? `${bold(ent.meta.title)} by ${bold(ent.meta.author)}` : `${bold(amount)} songs`}!`),
            err => message.reply(`:x: ${err}`));

        return CommandReturn.EXIT;
    }

}