import { Message, Permissions, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../../command';
import {
    bold,
    EmbedIconType,
    emboss,
    generateSimpleEmbed
} from '../../../../../util';

export default class DisconnectCommand extends Command {

    constructor() {
        super('dc', CommandCategory.AUDIO, `Invalid usage: ${emboss('.dc')}`, null, [], Permissions.FLAGS.ADMINISTRATOR, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let vc = message.guild.voice;
        if (!vc) {
            message.reply(generateSimpleEmbed('Audio', EmbedIconType.AUDIO, `${bold('rkt')} isn\'t connected to a voice channel.`));
            return CommandReturn.EXIT;
        }

        vc.connection.disconnect();
        await message.react('✅');
        return CommandReturn.EXIT;
    }

}