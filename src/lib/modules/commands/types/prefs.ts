import env from '../../../../../env.json';

import { Message, User } from 'discord.js';
import { EmbedIconType } from '../../../util';

import {
    asMention,
    Command,
    CommandReturn,
    CustomPermissions,
    emboss,
    getLatestTimeValue,
    mentionChannel
} from '@ilefa/ivy';

export class PrefsCommand extends Command {

    constructor(private uptime: number) {
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

        let { heapTotal, heapUsed } = process.memoryUsage();

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
                name: 'Service Information',
                value: `PID: ${emboss(process.pid)}\n` 
                     + `UID: ${emboss(process.getuid())}\n`
                     + `Platform: ${emboss(process.platform)}\n`
                     + `Version: ${emboss(await this.engine.getCurrentVersion())}\n`
                     + `Channel: ${emboss(await this.engine.getReleaseChannel())}\n`
                     + `Memory: ${emboss((heapUsed / 1024 / 1024).toFixed(1) + 'MB/' + (heapTotal / 1024 / 1024).toFixed(1) + 'MB')}\n` 
                     + `Uptime: ${emboss(getLatestTimeValue(Date.now() - this.uptime))}`,
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