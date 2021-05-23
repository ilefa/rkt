import { EmbedIconType } from '../../../util';
import { Message, Permissions, User } from 'discord.js';
import { asMention, bold, Command, CommandReturn, emboss, time } from '@ilefa/ivy';

export class InvitesCommand extends Command {

    constructor() {
        super('invites', `Invalid usage: ${emboss('.invites')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let invites = await message.guild.fetchInvites();
        if (!invites || invites.size === 0) {
            message.reply(this.embeds.build('Invites Overview', EmbedIconType.JACK, `There are no available invites for ${emboss(message.guild.name)}.`, null, message));
            return CommandReturn.EXIT;
        }
        
        let str = '';
        invites
            .array()
            .sort((a, b) => b.uses - a.uses)
            .slice(1, 25)
            .map((invite, i) => {
                str += `${bold(invite.uses.toLocaleString() + ' uses')} - ${bold(invite.code)} by ${asMention(invite.inviter)} ${emboss(`created ${time(invite.createdAt.getTime(), 'MMM Do, YYYY')})`)}\n`;
            });

        message.reply(this.embeds.build('Invites Overview', EmbedIconType.JACK, str.trimEnd(), null, message));
        return CommandReturn.EXIT;
    }

}