import { EmbedIconType } from '../../../util';
import { Message, Permissions, User } from 'discord.js';

import {
    asMention,
    bold,
    Command,
    CommandReturn,
    emboss,
    italic,
    join,
    numberEnding
} from '@ilefa/ivy';

export class WhoHasCommand extends Command {

    constructor() {
        super('whohas', `Invalid usage: ${emboss('.whohas <roleName..>')}`, null, [], Permissions.FLAGS.ADMINISTRATOR, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            return CommandReturn.HELP_MENU;
        }

        let input = args.join(' ');
        if (!input || !input.length) {
            message.reply(this.embeds.build('Role Information', EmbedIconType.PREFS, `Invalid or malformed role name: ${emboss(input)}`, null, message));
            return CommandReturn.EXIT;
        }

        let role = message
            .guild
            .roles
            .cache
            .find(role => role.name.toLowerCase() === input.toLowerCase());

        if (!role) {
            message.reply(this.embeds.build('Role Information', EmbedIconType.PREFS, `Unable to locate role with name ${emboss(input)}.`, null, message));
            return CommandReturn.EXIT;
        }

        let { name, color, members: m } = role;
        let members = m.array();
        let len = members.length;
        members = members.slice(0, Math.min(members.length, 80));
        let sliced = len - members.length;

        let str = join(members.sort((a, b) => a.displayName.localeCompare(b.displayName)), ', ', member => asMention(member.id));
        let total = members.length + sliced;
        message.reply(this.embeds.build('Role Information', EmbedIconType.PREFS,
            `${bold(`${total} member${numberEnding(total)} with ${name}`)}\n\n` 
                + `${str + (sliced !== 0 ? `, ${italic(`+ ${sliced} more`)}` : '')}`, null, message)
            .setColor(color));
            
        return CommandReturn.EXIT;
    }

}