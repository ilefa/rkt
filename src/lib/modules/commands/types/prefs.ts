import env from '../../../../../env.json';

import { Message, User } from 'discord.js';
import { EmbedIconType } from '../../../util';

import {
    asMention,
    Command,
    CommandReturn,
    CustomPermissions,
    emboss,
    mentionChannel
} from '@ilefa/ivy';

export class PrefsCommand extends Command {

    constructor() {
        super('prefs', `Invalid usage: ${emboss('.prefs')}`, null, [], CustomPermissions.SUPER_PERMS, false, false, [], [], true);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let superPerms = '';
        this.manager.engine.opts.superPerms.map(user => {
            superPerms += ` • ${asMention(user)}\n`
        })

        let futures = '';
        env.futures.map(future => {
            futures += ` • ${emboss(future)}\n`
        })

        let verbose = '';
        this.manager.engine.opts.reportErrors.map(server => {
            verbose += ` • ${emboss(server)}\n`;
        });

        message.reply(this.embeds.build('rkt preferences', EmbedIconType.PREFS, '', [
            {
                name: 'SuperPerms Users',
                value: superPerms,
                inline: true
            },
            {
                name: 'Futures Tickers',
                value: futures,
                inline: true
            },
            {
                name: 'Verbose Servers',
                value: verbose,
                inline: true
            },
            {
                name: 'Command Deck',
                value: mentionChannel(env.commandDeck),
                inline: true
            }
        ], message));
        return CommandReturn.EXIT;
    }

}