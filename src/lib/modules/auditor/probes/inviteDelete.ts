import { bold } from '@ilefa/ivy';
import { AuditorProbe } from '..';
import { Invite } from 'discord.js';

export class InviteDeleteProbe extends AuditorProbe {
    
    constructor() {
        super('Invite Delete', 'inviteDelete');
    }
    
    report = async (...args: any[]) => {
        let invite: Invite = args[0][0];
        let entry = this.getEntryForGuild(invite.guild);
        let reports = await this.getReportsChannel(invite.guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        reports.send(`${this.manager.INVITE} Invite ${bold(invite.code)} was deleted${displayServer ? ` from ${bold(invite.guild.name)}` : ``}.`);
    }

    shouldReport = (...args: any[]): boolean => {
        let invite: Invite = args[0][0];
        let entry = this.getEntryForGuild(invite.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}