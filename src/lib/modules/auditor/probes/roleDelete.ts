import { bold } from '@ilefa/ivy';
import { Role } from 'discord.js';
import { AuditorProbe } from '..';

export class RoleDeleteProbe extends AuditorProbe {
    
    constructor() {
        super('Role Delete', 'roleDelete');
    }
    
    report = async (...args: any[]) => {
        let role: Role = args[0][0];
        let entry = this.getEntryForGuild(role.guild);
        let reports = await this.getReportsChannel(role.guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        reports.send(`${this.manager.ROLE} Role ${bold(role.name)} was deleted${displayServer ? ` from ${bold(role.guild.name)}` : ``}.`);
    }

    shouldReport = (...args: any[]): boolean => {
        let invite: Role = args[0][0];
        let entry = this.getEntryForGuild(invite.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}