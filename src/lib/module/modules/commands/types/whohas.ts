import { Command, CommandCategory, CommandReturn } from '../command';
import { Message, Permissions, User } from 'discord.js';
import {
    asMention,
    bold,
    EmbedIconType,
    emboss,
    join,
    generateSimpleEmbed,
    italic,
    numberEnding
} from '../../../../util';

export default class WhoHasCommand extends Command {

    constructor() {
        super('whohas', CommandCategory.GENERAL, `Invalid usage: ${emboss('.whohas <roleName..>')}`, null, [], Permissions.FLAGS.ADMINISTRATOR, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            return CommandReturn.HELP_MENU;
        }

        let input = args.join(' ');
        if (!input || !input.length) {
            message.reply(generateSimpleEmbed('Role Information', EmbedIconType.PREFS, `Invalid or malformed role name: ${emboss(input)}`));
            return CommandReturn.EXIT;
        }

        let role = message
            .guild
            .roles
            .cache
            .find(role => role.name.toLowerCase() === input.toLowerCase());

        if (!role) {
            message.reply(generateSimpleEmbed('Role Information', EmbedIconType.PREFS, `Unable to locate role with name ${emboss(input)}.`));
            return CommandReturn.EXIT;
        }

        let { name, color, members: m } = role;
        let members = m.array();
        let sliced = 0;
        if (members.length > 80) {
            sliced = Math.min(members.length - 80);
            members = members.slice(0, 80);
        }

        let str = join(members
            .sort((a, b) => a.displayName.localeCompare(b.displayName)), ', ', member => asMention(member.id));

        let total = members.length + sliced;
        message.reply(generateSimpleEmbed('Role Information', EmbedIconType.PREFS,
            `${bold(`${total} member${numberEnding(total)} with ${name}`)}\n\n` 
                + `${str}${sliced !== 0 ? `, ${italic(`+ ${sliced} more`)}` : ''}`)
            .setColor(color));
        return CommandReturn.EXIT;
    }

}