import { EmbedIconType } from '../../../util';
import { Message, MessageAttachment, User } from 'discord.js';

import {
    bold,
    Command,
    CommandReturn,
    CUSTOM_PERMS,
    emboss,
    ModuleManager
} from '@ilefa/ivy';

export class StopCommand extends Command {

    moduleManager: ModuleManager;

    constructor(moduleManager: ModuleManager) {
        super('stop', `Invalid usage: ${emboss('.stop')}`, 'change da world, my final message... goodbye', [], CUSTOM_PERMS.SUPER_PERMS, false);
        this.moduleManager = moduleManager;
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        message.reply(this.manager.engine.embeds.build('rkt', EmbedIconType.PREFS, `Please confirm shutdown by responding with ${bold('Y(ES)')}.`, null, message));
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
                    msg.reply(this.manager.engine.embeds.build('rkt', EmbedIconType.PREFS, 'Shutdown cancelled.', null, message));
                    return;
                }

                let attachment = new MessageAttachment('https://media1.tenor.com/images/17c977bb6585d853971cda6d27f1f834/tenor.gif');
                msg.channel.send(`${bold('\\o')} ok bro cya`);
                msg.channel.send(attachment);

                setTimeout(() => {
                    this.manager.engine.logger.info('rkt', 'Shutting down.');
                    this.moduleManager.disable();
                    message.client.destroy();
                    process.exit();
                }, 5000);
            })
            .catch(() => message.channel.send(this.manager.engine.embeds.build('rkt', EmbedIconType.PREFS, 'Shutdown confirmation timed out.', null, message)))
        return CommandReturn.EXIT;
    }

}