import CommandComponent from '../../../../components/component';

import { CommandReturn } from '../../../../command';
import { User, Message, Permissions } from 'discord.js';
import { VoiceBoardManager } from '../../../../../vcboard';
import { bold, EmbedIconType, generateSimpleEmbed } from '../../../../../../../util';

export default class ResetGuildCommand extends CommandComponent<VoiceBoardManager> {

    constructor() {
        super('resetall', 'resetall', Permissions.FLAGS.ADMINISTRATOR);
    }

    async execute(user: User, message: Message, args: string[]) {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        message.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board Admin`, EmbedIconType.XP, `Please confirm guild reset by responding with ${bold('Y(ES)')}.`));
        message.channel.awaitMessages((message: Message) => message && message.author.id === user.id,
            {
                max: 1,
                time: 15000,
                errors: ['time'] 
            })
            .then(async _m => {
                let msg = _m.first();
                if (!msg 
                        || msg.content.toLowerCase() !== 'y' 
                        && msg.content.toLowerCase() !== 'yes') {
                    msg.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board Admin`, EmbedIconType.XP, 'Reset cancelled.'));
                    return;
                }

                let reset = await this.manager.resetAll(message.guild.id);
                if (!reset) {
                    msg.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board Admin`, EmbedIconType.XP, `Failed to reset voice board records for ${bold(message.guild.name)}.`));
                    return;
                }

                msg.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board Admin`, EmbedIconType.XP, `Successfully reset records for ${bold(message.guild.name)}.`));
            })
            .catch(() => message.channel.send(generateSimpleEmbed(`${message.guild.name} - Voice Board Admin`, EmbedIconType.XP, 'Reset confirmation timed out.')));
        return CommandReturn.EXIT;
    }

}