import { Message, MessageEmbed, MessageReaction, TextChannel, User } from 'discord.js';
import { asMention, CUSTOM_PERMS, emboss, generateEmbed, generateSimpleEmbed } from '../../../../util';
import { Command, CommandReturn } from '../command';

export default class PollCommand extends Command {

    constructor() {
        super('poll', `Invalid usage: ${emboss('.poll <question>')}`, null, [], CUSTOM_PERMS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length < 1) return CommandReturn.HELP_MENU;

        let questionString = emboss(args.join(' ')) + '\n- Asked by: ' + asMention(user);

        let poll = await message.channel.send(generateSimpleEmbed('Polls', questionString));
        ['👍', '👎', '🤷'].map(async emote => await poll.react(emote));

        return CommandReturn.EXIT;
    }

}