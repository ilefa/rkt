import { bold } from '@ilefa/ivy';
import { AuditorProbe } from '..';
import { GuildMember } from 'discord.js';

// not done
export class GuildMemberUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Member Update', 'guildMemberUpdate');
    }
    
    report = async (...args: any[]) => {
        let a: GuildMember = args[0][0];
        let b: GuildMember = args[0][1];
        // let entry = this.getEntryForGuild(member.guild);
        // let reports = await this.getReportsChannel(member.guild);
        // if (!reports)
        //     return;

        // let displayServer = entry.tracks.length !== 1;
        // reports.send(`${this.manager.EMOTE} ${bold(member.user.username + '#' + member.user.discriminator)} joined${displayServer ? ` ${bold(member.guild.name)}` : ``}.`);
    }

    shouldReport = (...args: any[]): boolean => {
        let b: GuildMember = args[0][1];
        let entry = this.getEntryForGuild(b.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}