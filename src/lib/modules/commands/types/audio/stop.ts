import AudioManager from '../../../audio';

import { Message, Permissions, User } from 'discord.js';
import { Command, CommandReturn, emboss } from '@ilefa/ivy';

export class StopCommand extends Command {

    constructor() {
        super('stop', `Invalid usage: ${emboss('.stop')}`, null, [], Permissions.FLAGS.BAN_MEMBERS, false, false, ['DJ']);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0)
            return CommandReturn.HELP_MENU;

        let audioManager = this.engine.moduleManager.require<AudioManager>('Audio');
        audioManager.clear(message.guild,
            amt => message.channel.send(`:stop_button: Audio stopped and queue cleared.`),
            err => message.reply(`:x: ${err}`));
        return CommandReturn.EXIT;

    }

}