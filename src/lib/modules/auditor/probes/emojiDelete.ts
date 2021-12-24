import { bold } from '@ilefa/ivy';
import { AuditorProbe } from '..';
import { GuildEmoji } from 'discord.js';

export class EmojiDeleteProbe extends AuditorProbe {
    
    constructor() {
        super('Emoji Delete', 'emojiDelete');
    }
    
    report = async (...args: any[]) => {
        let emote: GuildEmoji = args[0][0];
        let entry = this.getEntryForGuild(emote.guild);
        let reports = await this.getReportsChannel(emote.guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        reports.send(`${this.manager.EMOTE} Emote ${bold(emote.name)} was deleted${displayServer ? ` from ${bold(emote.guild.name)}` : ``}.`);
    }

    shouldReport = (...args: any[]): boolean => {
        let emote: GuildEmoji = args[0][0];
        let entry = this.getEntryForGuild(emote.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}