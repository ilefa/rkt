import { asEmote, bold } from '@ilefa/ivy';
import { AuditorProbe } from '..';
import { GuildEmoji } from 'discord.js';

// I think the only thing that can change is the name, since emojiDelete is emitted when it's deleted..
enum EmojiUpdateCause {
    NAME, UNKNOWN
}

export class EmojiUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Emoji Update', 'emojiUpdate');
    }
    
    report = async (...args: any[]) => {
        let a: GuildEmoji = args[0][0];
        let b: GuildEmoji = args[0][1];

        let entry = this.getEntryForGuild(b.guild);
        let reports = await this.getReportsChannel(b.guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        let cause = this.detectChange(a, b);
        reports.send(this.generateChangeMessage(a, b, cause, displayServer));
    }

    shouldReport = (...args: any[]): boolean => {
        let emote: GuildEmoji = args[0][0];
        let entry = this.getEntryForGuild(emote.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

    private generateChangeMessage = (a: GuildEmoji, b: GuildEmoji, cause: EmojiUpdateCause, display: boolean) => {
        let end = display ? ` in ${bold(b.guild.name)}` : ``;
        if (cause == EmojiUpdateCause.UNKNOWN)
            return `${this.manager.EMOTE} Emote ${bold(b.name)} (${asEmote(b)}) was somehow updated${end}.`;

        if (cause == EmojiUpdateCause.NAME)
            return `${this.manager.EMOTE} Emote ${bold(a.name)} (${asEmote(b)}) was renamed to ${bold(b.name) + end}.`;
    }

    private detectChange = (a: GuildEmoji, b: GuildEmoji) => {
        if (a.name !== b.name) return EmojiUpdateCause.NAME;
        else return EmojiUpdateCause.UNKNOWN;
    }

}