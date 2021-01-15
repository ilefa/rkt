import BirthdayManager from '../../../../birthday';
import CommandComponent from '../../../components/component';

import { CommandReturn } from '../../../command';
import { Message, Permissions, User } from 'discord.js';
import { bold, EmbedIconType, generateSimpleEmbed } from '../../../../../../util';

export default class SetBirthdayChannelCommand extends CommandComponent<BirthdayManager> {

    constructor() {
        super('channel', 'channel [#ref]', Permissions.FLAGS.ADMINISTRATOR);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            let channel = await this.manager.getChannel(message.guild);
            if (!channel) {
                message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, 'The birthday channel is not set.'));
                return CommandReturn.EXIT;
            }

            message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `Current birthday channel: <#${channel.id}>`));
            return CommandReturn.EXIT;
        }

        if (message.mentions.channels.size !== 1) {
            message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, 'Missing or excess channel specification.'));
            return CommandReturn.EXIT;
        }

        let target = message.mentions.channels.array()[0];
        if (!target) {
            message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, 'Invalid channel specification.'));
            return CommandReturn.EXIT;
        }

        this.manager.setChannel(message.guild, target);
        message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `Birthday channel for ${bold(message.guild.name)} set to <#${target.id}>.`));
        return CommandReturn.EXIT;
    }
    
}