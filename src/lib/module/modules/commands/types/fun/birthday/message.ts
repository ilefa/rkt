import BirthdayManager from '../../../../birthday';
import CommandComponent from '../../../components/component';

import { CommandReturn } from '../../../command';
import { Message, Permissions, User } from 'discord.js';
import { bold, codeBlock, EmbedIconType, emboss, generateSimpleEmbed } from '../../../../../../util';

export default class SetBirthdayMessagesCommand extends CommandComponent<BirthdayManager> {

    constructor() {
        super('message', 'message [add | remove] [input]', Permissions.FLAGS.ADMINISTRATOR);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            let messages = this.manager.getMessages(message.guild);
            if (!messages) {
                message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `The birthday messages are configured for ${bold(message.guild.name)}.`));
                return CommandReturn.EXIT;
            }

            let str = ``;
            messages.map((msg, i) => {
                str += `${bold((i + 1))}. ${msg}\n`
            })

            message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `${bold(`Birthday Messages (${messages.length})`)}\n\n${str.trimEnd()}`));
            return CommandReturn.EXIT;
        }

        let messages = this.manager.getMessages(message.guild);
        if (args[0].toLowerCase() === 'add') {
            let prompt = args.slice(1).join(' ');
            if (!prompt.includes('%s')) {
                message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `Message must contain user placeholder, ${emboss('%s')}.`));
                return CommandReturn.EXIT;
            }
            
            if (messages.includes(prompt)) {
                message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `This message has already been registered.`));
                return CommandReturn.EXIT;
            }

            messages.push(prompt);
            message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `Successfully added the following message:\n${codeBlock('', prompt)}`));
            this.manager.setMessages(message.guild, messages);
            return CommandReturn.EXIT;
        }

        if (args[0].toLowerCase() === 'remove') {
            let str = ``;
            messages.map((msg, i) => {
                str += `${bold((i + 1))}. ${msg}\n`
            })

            message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `${bold(`Birthday Messages (${messages.length})`)}\n` 
                + `Please input the number corresponding to the message you'd like to remove.\n\n` 
                + `${str.trimEnd()}`));

            message.channel.awaitMessages((message: Message) => message && message.author.id === user.id,
                {
                    max: 1,
                    time: 15000,
                    errors: ['time'] 
                })
                .then(_m => {
                    let msg = _m.first();
                    if (!msg || isNaN(parseInt(msg.content))) {
                        msg.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `Non-Numeric Selection: ${emboss(msg.content ? msg.content : '[missing]')}`));
                        return;
                    }

                    let selection = parseInt(msg.content);
                    let match = messages[selection - 1];
                    if (!match) {
                        msg.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `Invalid selection: ${emboss(selection)}`));
                        return;
                    }

                    messages = messages.splice(selection, selection);
                    message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `Removed selection ${bold('#' + selection)}.`));
                    this.manager.setMessages(message.guild, messages);
                })
                .catch(() => message.channel.send(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, 'Removal selection timed out.')))
        }

        return CommandReturn.EXIT;
    }
    
}