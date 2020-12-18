import env from '../../../env.json';

import { Message, User } from 'discord.js';
import { Command, CommandReturn } from '../command';
import { asEmote, asMention, bold, cond, CUSTOM_PERMS, emboss, generateEmbed, italic, mentionChannel, resolveEmote } from '../../lib/util';

export default class PrefsCommand extends Command {

    constructor() {
        super('prefs', `Invalid usage: ${emboss('.prefs')}`, null, [], CUSTOM_PERMS.SUPERMAN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let superPerms = '';
        env.superPerms.map(user => {
            superPerms += ` • ${asMention(user)}\n`
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

        let embed = generateEmbed('Stonks Bot Preferences', '', [
            {
                name: 'Verbose Servers',
                value: verbose,
                inline: true
            },
            {
                name: 'SuperPerms Clients',
                value: superPerms,
                inline: true
            },
            {
                name: 'CountHer Settings',
                value: ` • Max Conseq. Lobbies: ${bold(env.countHerMaxLobbies)}\n • Reports Channel: ${mentionChannel(env.countHerFailChannel)}`,
                inline: false,
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