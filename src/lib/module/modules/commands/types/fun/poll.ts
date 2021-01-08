import { Command, CommandReturn } from '../../command';
import { Message, Permissions, User } from 'discord.js';
import {
    asMention,
    bold,
    emboss,
    generateEmbed,
    generateSimpleEmbed,
    italic,
    RESPONSE_GROUP_EMOJI,
    RESPONSE_GROUP_EMOJI_RAW
} from '../../../../../util';

export default class PollCommand extends Command {

    constructor() {
        super('poll', `Invalid usage: ${emboss('.poll <[question]> <[responses..]> ')} or ${emboss('.poll <question>')} `, null, [], Permissions.FLAGS.ADMINISTRATOR);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            return CommandReturn.HELP_MENU;
        }

        let prompt = args.join(' ');
        let components = prompt
            .split('[')
            .join('')
            .split(']')
            .map(ent => ent.trim())
            .filter(ent => ent !== '');

        // Simple polls
        if (components.length === 1) {
            let reply = await message.reply(generateSimpleEmbed('Polls', `${italic(prompt)}\nby ${asMention(user)}`));
            ['👍', '👎', '🤷'].map(async emote => await reply.react(emote));

            return CommandReturn.EXIT;
        }

        if (components.length > 0 && components.length < 3) {
            return CommandReturn.HELP_MENU;
        }

        // Complex polls
        let question = components[0].trim();
        let responses = components.slice(1);
        if (responses.length < 2 || responses.length > 20) {
            message.reply(generateEmbed('Polls', `${responses.length < 2 ? 'Too few response groups, must have have atleast two.' : 'Too many response groups, can have twenty at most.'}`, [
                {
                    name: 'Valid Response Specification',
                    value: emboss('[<response>]'),
                    inline: false
                },
                {
                    name: 'Valid Example',
                    value: emboss('.poll [do stonks go brrr?] [of course] [yes] [~~no~~]'),
                    inline: false
                }
            ]));

            return CommandReturn.EXIT;
        }

        let str = '';
        let emotes = [];
        responses.map((response, i) => {
            str += `${RESPONSE_GROUP_EMOJI[i]} ${response.trim()}\n`;
            emotes.push(RESPONSE_GROUP_EMOJI_RAW[i]);
        })

        let reply = await message.reply(generateSimpleEmbed('Polls', `${italic(question)}\n` 
            + `by ${asMention(user)}\n\n` 
            + `${bold('Responses')}\n` 
            + `${str.trim()}`));

        emotes.map(async emote => await reply.react(emote));
        return CommandReturn.EXIT;
    }

}