import env from '../../../../../../env.json';

import { Message, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../command';

import {
    asEmote,
    asMention,
    bold,
    CUSTOM_PERMS,
    EmbedIconType,
    emboss,
    generateEmbed,
    italic,
    mentionChannel,
    resolveEmote
} from '../../../../util';

export default class PrefsCommand extends Command {

    constructor() {
        super('prefs', CommandCategory.MISC, `Invalid usage: ${emboss('.prefs')}`, null, [], CUSTOM_PERMS.SUPERMAN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let superPerms = '';
        env.superPerms.map(user => {
            superPerms += ` • ${asMention(user)}\n`
        })

        let futures = '';
        env.futures.map(future => {
            futures += ` • ${emboss(future)}\n`
        })

        let schedules = `${env.alerts ? ':white_check_mark: Enabled' : ':x: Disabled'}\n~~${'-'.repeat(45)}~~\n`;
        env.schedules.map(schedule => {
            schedules += `**${schedule.name} | [${schedule.cron}]**\n${schedule.message}\n\n`
        });

        let phrases = `${env.react ? ':white_check_mark: Enabled' : ':x: Disabled'}\n~~${'-'.repeat(45)}~~\n`;
        env.reactPhrases
            .forEach(phrase => {
                let phraseEntry = '';
                phrase.phrases.forEach(p => phraseEntry += ` • ${emboss(p)}\n`)
                phrases += ` ${asEmote(resolveEmote(message.client, phrase.emote))} ${italic(phrase.name)}\n${phraseEntry.trimEnd()}\n\n`;
            });

        let verbose = '';
        env.reportErrors.map(server => {
            verbose += ` • ${emboss(server)}\n`;
        });

        let embed = generateEmbed('rkt Preferences', EmbedIconType.PREFS, '', [
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
                name: 'CountHer Settings',
                value: ` • Max Conseq. Lobbies: ${bold(env.countHerMaxLobbies)}\n • Reports Channel: ${mentionChannel(env.countHerFailChannel)}`,
                inline: true,
            },
            {
                name: `Alerts`,
                value: schedules,
                inline: true
            },
            {
                name: `Reactions`,
                value: phrases,
                inline: true
            }
        ]);

        message.reply(embed);
        return CommandReturn.EXIT;
    }

}