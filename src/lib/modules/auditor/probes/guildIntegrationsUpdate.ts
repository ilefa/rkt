import { bold } from '@ilefa/ivy';
import { AuditorProbe } from '..';
import { Guild } from 'discord.js';

export class GuildIntegrationsUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Integrations Update', 'guildIntegrationsUpdate');
    }
    
    report = async (...args: any[]) => {
        let guild: Guild = args[0][0];
        let entry = this.getEntryForGuild(guild);
        let reports = await this.getReportsChannel(guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        reports.send(`${this.manager.COG} Integrations were updated${displayServer ? ` for ${bold(guild.name)}` : ``}.`);
    }

    shouldReport = (...args: any[]): boolean => {
        let guild: Guild = args[0][0];
        let entry = this.getEntryForGuild(guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}