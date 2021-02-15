import ModuleManager from '../../../manager';
import * as Logger from '../../../../logger';

import { Message, MessageAttachment, User } from "discord.js";
import { Command, CommandCategory, CommandReturn } from "../command";

import {
    bold,
    CUSTOM_PERMS,
    EmbedIconType,
    emboss,
    generateSimpleEmbed
} from "../../../../util";

export default class StopCommand extends Command {

    moduleManager: ModuleManager;

    constructor(moduleManager: ModuleManager) {
        super('stop', CommandCategory.MISC, `Invalid usage: ${emboss('.stop')}`, 'change da world, my final message... goodbye', [], CUSTOM_PERMS.SUPERMAN);
        this.moduleManager = moduleManager;
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        message.reply(generateSimpleEmbed('rkt', EmbedIconType.PREFS, `Please confirm shutdown by responding with ${bold('Y(ES)')}.`));
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
                    msg.reply(generateSimpleEmbed('rkt', EmbedIconType.PREFS, 'Shutdown cancelled.'));
                    return;
                }

                let attachment = new MessageAttachment('https://media1.tenor.com/images/17c977bb6585d853971cda6d27f1f834/tenor.gif');
                msg.channel.send(`${bold('\\o')} ok bro cya`);
                msg.channel.send(attachment);

                setTimeout(() => {
                    Logger.info('rkt', 'Shutting down.');
                    this.moduleManager.disable();
                    message.client.destroy();
                    process.exit();
                }, 5000);
            })
            .catch(() => message.channel.send(generateSimpleEmbed('rkt', EmbedIconType.PREFS, 'Shutdown confirmation timed out.')))
        return CommandReturn.EXIT;
    }

}