import moment from 'moment';

import { Message, Permissions, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../command';
import {
    asMention,
    bold,
    emboss,
    EmbedIconType,
    generateSimpleEmbed
} from '../../../../util';

export default class InvitesCommand extends Command {

    constructor() {
        super('invites', CommandCategory.GENERAL, `Invalid usage: ${emboss('.invites')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let invites = await message.guild.fetchInvites();
        if (!invites || invites.size === 0) {
            message.reply(generateSimpleEmbed('Invites Overview', EmbedIconType.JACK, `There are no available invites for ${emboss(message.guild.name)}.`));
            return CommandReturn.EXIT;
        }
        
        let str = '';
        invites
            .array()
            .sort((a, b) => b.uses - a.uses)
            .slice(1, 25)
            .map((invite, i) => {
                str += `${bold(invite.uses.toLocaleString() + ' uses')} - ${bold(invite.code)} by ${asMention(invite.inviter)} ${emboss(`created ${moment(invite.createdAt).format('MMM Do, YYYY')})`)}\n`;
            });

        message.reply(generateSimpleEmbed('Invites Overview', EmbedIconType.JACK, str.trimEnd()));
    }

}