import { AuditorProbe } from '..';
import { Guild, User } from 'discord.js';
import { asMention, bold, emboss } from '@ilefa/ivy';

export class GuildBanAddProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Ban Add', 'guildBanAdd');
    }
    
    report = async (...args: any[]) => {
        let guild: Guild = args[0][0];
        let user: User = args[0][1];
        let entry = this.getEntryForGuild(guild);
        let reports = await this.getReportsChannel(guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        let auditReport = await guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_ADD'
        });

        let auditEntry = auditReport.entries.first();
        if (!auditEntry || (auditEntry.target as User).id !== user.id) {
            reports.send(`${this.manager.MEMBERS} ${asMention(user)} (${user.id}) was banned${displayServer ? ` from ${bold(guild.name)}` : ``}.`);
            return;
        }

        let { executor, reason } = auditEntry;
        reports.send(`${this.manager.MEMBERS} ${asMention(user)} (${user.id}) was banned${displayServer ? ` from ${bold(guild.name)}` : ``} by ${bold(this.asName(executor))}.` 
                   + reason ? `${this.manager.DIVIDER} The provided reason for this punishment was ${emboss(reason)}.` : '');

    }

    shouldReport = (...args: any[]): boolean => {
        let guild: Guild = args[0][0];
        let entry = this.getEntryForGuild(guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}