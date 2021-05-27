import { AuditorProbe } from '..';
import { GuildEmoji } from 'discord.js';
import { asEmote, bold } from '@ilefa/ivy';

export class EmojiCreateProbe extends AuditorProbe {
    
    constructor() {
        super('Emoji Create', 'emojiCreate');
    }
    
    report = async (...args: any[]) => {
        let emote: GuildEmoji = args[0][0];
        let entry = this.getEntryForGuild(emote.guild);
        let reports = await this.getReportsChannel(emote.guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        reports.send(`${this.manager.EMOTE} Emote ${bold(emote.name)} (${asEmote(emote)}) was created${displayServer ? ` in ${bold(emote.guild.name)}` : ``}.`);
    }

    shouldReport = (...args: any[]): boolean => {
        let emote: GuildEmoji = args[0][0];
        let entry = this.getEntryForGuild(emote.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}