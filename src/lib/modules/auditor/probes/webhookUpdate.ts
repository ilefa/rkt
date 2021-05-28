import { AuditorProbe } from '..';
import { bold, mentionChannel } from '@ilefa/ivy';
import { NewsChannel, StoreChannel, TextChannel } from 'discord.js';

type ChannelLike = TextChannel | NewsChannel | StoreChannel;

export class WebhookUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Webhook Update', 'webhookUpdate');
    }
    
    report = async (...args: any[]) => {
        let channel: ChannelLike = args[0][0];
        let entry = this.getEntryForGuild(channel.guild);
        let reports = await this.getReportsChannel(channel.guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        reports.send(`${this.manager.WEBHOOK} Webhooks were updated for ${bold(channel.name)} (${mentionChannel(channel.id)})${displayServer ? ` in ${bold(channel.guild.name)}` : ``}.`);
    }

    shouldReport = (...args: any[]): boolean => {
        let channel: ChannelLike = args[0][0];
        let entry = this.getEntryForGuild(channel.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}