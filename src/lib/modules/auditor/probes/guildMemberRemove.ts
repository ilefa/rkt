import { bold } from '@ilefa/ivy';
import { AuditorProbe } from '..';
import { GuildMember } from 'discord.js';

export class GuildMemberRemoveProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Member Remove', 'guildMemberRemove');
    }
    
    report = async (...args: any[]) => {
        let member: GuildMember = args[0][0];
        let entry = this.getEntryForGuild(member.guild);
        let reports = await this.getReportsChannel(member.guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        reports.send(`${this.manager.LEAVE} ${bold(member.user.username + '#' + member.user.discriminator)} left${displayServer ? ` ${bold(member.guild.name)}` : ``}.`);
    }

    shouldReport = (...args: any[]): boolean => {
        let member: GuildMember = args[0][0];
        let entry = this.getEntryForGuild(member.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}