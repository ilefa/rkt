import * as Logger from '../../../../logger';

import { Command, CommandReturn } from "../command";
import { Message, MessageAttachment, User } from "discord.js";

import {
    bold,
    CUSTOM_PERMS,
    EmbedIconType,
    emboss,
    generateSimpleEmbed
} from "../../../../util";

export default class StopCommand extends Command {

    constructor() {
        super('stop', `Invalid usage: ${emboss('.stop')}`, 'change da world, my final message... goodbye', [], CUSTOM_PERMS.SUPERMAN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        message.reply(generateSimpleEmbed('Stonks', EmbedIconType.PREFS, `Please confirm shutdown by responding with ${bold('Y(ES)')}.`));
        message.channel.awaitMessages((message: Message) => message && message.author.id === user.id,
            {
                max: 1,
                time: 15000,
                errors: ['time'] 
            })
            .then(_m => {
                let msg = _m.first();
                if (!msg 
                        || msg.content.toLowerCase() !== 'y' 
                        && msg.content.toLowerCase() !== 'yes') {
                    msg.reply(generateSimpleEmbed('Stonks', EmbedIconType.PREFS, 'Shutdown cancelled.'));
                    return;
                }

                let attachment = new MessageAttachment('https://media1.tenor.com/images/17c977bb6585d853971cda6d27f1f834/tenor.gif');
                msg.channel.send(`${bold('\\o')} ok bro cya`);
                msg.channel.send(attachment);

                setTimeout(() => {
                    Logger.info('Stonks', 'Shutting down.');
                    message.client.destroy();
                    process.exit();
                }, 5000);
            })
            .catch(() => message.channel.send(generateSimpleEmbed('Stonks', EmbedIconType.PREFS, 'Shutdown confirmation timed out.')))
        return CommandReturn.EXIT;
    }

}