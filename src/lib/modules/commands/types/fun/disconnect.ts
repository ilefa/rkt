import { EmbedIconType } from '../../../../util';
import { Message, Permissions, User } from 'discord.js';
import { bold, Command, CommandReturn, emboss } from '@ilefa/ivy';

export class DisconnectCommand extends Command {

    constructor() {
        super('dc', `Invalid usage: ${emboss('.dc')}`, null, [], Permissions.FLAGS.ADMINISTRATOR, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let vc = message.guild.voice;
        if (!vc) {
            message.reply(this.manager.engine.embeds.build('Audio', EmbedIconType.AUDIO, `${bold('rkt')} isn\'t connected to a voice channel.`, null, message));
            return CommandReturn.EXIT;
        }

        vc.connection.disconnect();
        await message.react('✅');
        return CommandReturn.EXIT;
    }

}