import { Command, CommandCategory, CommandReturn } from '../command';
import { Message, Permissions, User } from 'discord.js';
import {
    asMention,
    bold,
    EmbedIconType,
    emboss,
    join,
    generateSimpleEmbed
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

        let { name, color, members } = role;
        let str = join(members
            .array()
            .sort((a, b) => a.displayName.localeCompare(b.displayName)), ', ', member => asMention(member.id));

        message.reply(generateSimpleEmbed('Role Information', EmbedIconType.PREFS,
            `${bold(`Members with ${name} Role (${members.size})`)}\n\n${str}`)
            .setColor(color));
        return CommandReturn.EXIT;
    }

}