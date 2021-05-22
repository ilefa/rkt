import { EmbedIconType } from '../../../../util';
import { Message, Permissions, User } from 'discord.js';
import { bold, Command, CommandReturn, emboss } from '@ilefa/ivy';

export class VolumeCommand extends Command {

    constructor() {
        super('vol', `Invalid usage: ${emboss('.vol <0 - 1.0>')}`, null, [], Permissions.FLAGS.BAN_MEMBERS, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0)
            return CommandReturn.HELP_MENU;
            
        let vol = parseFloat(args[0]);
        if (isNaN(vol))
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

        connection.dispatcher.setVolumeLogarithmic(vol);
        message.channel.send(`:speaker: Volume Set: ${bold(vol)}`);

        return CommandReturn.EXIT;
    }

}