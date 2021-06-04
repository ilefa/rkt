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

        let internal = '';
        this.manager.engine.opts.reportErrors.map(server => {
            internal += ` • ${emboss(server)}\n`;
        });

        let auditorServers = '';
        []
            .concat(Array.from(env.auditor, ({ tracks }) => tracks))
            .join()
            .split(',')
            .forEach(server => {
                auditorServers += ` • ${emboss(server)}\n`;
            });

        message.reply(this.embeds.build('rkt preferences', EmbedIconType.PREFS, '', [
            {
                name: 'SuperPerms Users',
                value: superPerms,
                inline: true
            },
            {
                name: 'Internal Servers',
                value: internal,
                inline: true
            },
            {
                name: 'Auditor Servers',
                value: auditorServers,
                inline: true
            },
            {
                name: 'Futures Tickers',
                value: futures,
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