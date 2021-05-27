import { AuditorProbe } from '..';
import { Guild, User } from 'discord.js';
import { asMention, bold } from '@ilefa/ivy';

export class GuildBanRemoveProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Ban Remove', 'guildBanRemove');
    }
    
    report = async (...args: any[]) => {
        let guild: Guild = args[0][0];
        let user: User = args[0][1];
        let entry = this.getEntryForGuild(guild);
        let reports = await this.getReportsChannel(guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        reports.send(`${this.manager.MEMBERS} ${asMention(user)} (${user.id}) was unbanned${displayServer ? ` in ${bold(guild.name)}` : ``}.`);
    }

    shouldReport = (...args: any[]): boolean => {
        let guild: Guild = args[0][0];
        let entry = this.getEntryForGuild(guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}