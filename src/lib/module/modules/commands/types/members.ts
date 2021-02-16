import { Message, Permissions, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../command';
import {
    bold,
    count,
    EmbedIconType,
    emboss,
    generateSimpleEmbedWithThumbnail,
    GRAY_CIRCLE,
    GREEN_CIRCLE,
    numberEnding,
    RED_CIRCLE,
    YELLOW_CIRCLE
} from '../../../../util';

export default class MembersCommand extends Command {

    constructor() {
        super('members', CommandCategory.GENERAL, `Invalid usage: ${emboss('.members')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let members = message
            .guild
            .members
            .cache
            .array()
            .map(member => member.user);

        let bots = count(members, member => member.bot);
        let online = count(members, member => member.presence.status === 'online');
        let idle = count(members, member => member.presence.status ===  'idle');
        let dnd = count(members, member => member.presence.status ===  'dnd');
        let offline = count(members, member => member.presence.status ===  'offline');

        message.reply(generateSimpleEmbedWithThumbnail('Member Insights', EmbedIconType.JACK, `${bold('Overview')}\n` 
            + `There ${members.length === 1 ? 'is' : 'are'} ${emboss(members.length)} member${numberEnding(members.length)} in ${bold(message.guild.name)}.\n` 
            + `Of these members, ${emboss(bots)} ${bots === 1 ? 'is a' : 'are'} bot${numberEnding(bots)}.\n\n` 
            + `${bold('Members by Status')}\n` 
            + `${GREEN_CIRCLE} ${online.toLocaleString()} member${numberEnding(online)}\n` 
            + `${YELLOW_CIRCLE} ${idle.toLocaleString()} member${numberEnding(idle)}\n` 
            + `${RED_CIRCLE} ${dnd.toLocaleString()} member${numberEnding(dnd)}\n` 
            + `${GRAY_CIRCLE} ${offline.toLocaleString()} member${numberEnding(offline)}`, message.guild.iconURL()));

        return CommandReturn.EXIT;
    }

}