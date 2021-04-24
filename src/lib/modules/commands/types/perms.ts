import { Message, Permissions, User } from 'discord.js';
import { getEmoteForPermissions } from '../../../util';
import { bold, Command, CommandReturn, emboss } from '@ilefa/ivy';

export class PermissionsCommand extends Command {

    constructor() {
        super('perms', `Invalid usage: ${emboss('.perms')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let isSuperPerms = this.manager.engine.opts.superPerms.includes(user.id);
        let isAdmin = message.guild.member(user).hasPermission(Permissions.FLAGS.ADMINISTRATOR);
        let permString = 'member permissions';
        if (isSuperPerms && isAdmin) {
            permString = 'both super and admin permissions';
        }

        if (isSuperPerms && !isAdmin) {
            permString = 'super permissions';
        }

        if (!isSuperPerms && isAdmin) {
            permString = 'admin permissions';
        }

        message.reply(this.manager.engine.embeds.build(`${user.username}#${user.discriminator}'s Permissions`, user.avatarURL(),
            `${getEmoteForPermissions(isSuperPerms, isAdmin)} ${bold(user.username + '#' + user.discriminator)} has ${permString}.`, [], message));
        return CommandReturn.EXIT;
    }

}