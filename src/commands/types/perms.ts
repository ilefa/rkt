import env from '../../../env.json';

import { Message, MessageEmbed, Permissions, User } from 'discord.js';
import { bold, emboss, getEmoteForPermissions } from '../../lib/util';
import { Command, CommandReturn } from '../command';

export default class PermissionsCommand extends Command {

    constructor() {
        super('perms', `Invalid usage: ${emboss('.perms')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let isSuperPerms = env.superPerms.some(id => id === user.id);
        let isAdmin = message.guild.member(user).hasPermission(Permissions.FLAGS.ADMINISTRATOR);
        let permString = 'member permissions';
        if (isSuperPerms && isAdmin) {
            permString = 'both super and administrator permissions';
        }

        if (isSuperPerms && !isAdmin) {
            permString = 'super permissions';
        }

        if (!isSuperPerms && isAdmin) {
            permString = 'administrator permissions';
        }

        let embed = new MessageEmbed()
            .setTitle(`${user.username}#${user.discriminator}'s Permissions`)
            .setColor(0x27AE60)
            .setDescription(`${getEmoteForPermissions(isSuperPerms, isAdmin)} ${bold(user.username + '#' + user.discriminator)} has ${permString}.`)
            .setThumbnail(user.avatarURL());

        message.reply(embed);
        return CommandReturn.EXIT;
    }

}