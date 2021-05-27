import { bold } from '@ilefa/ivy';
import { AuditorProbe } from '..';
import { NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';

type ChannelLike = TextChannel | VoiceChannel | NewsChannel | StoreChannel;

export class ChannelDeleteProbe extends AuditorProbe {
    
    constructor() {
        super('Channel Delete', 'channelDelete');
    }
    
    report = async (...args: any[]) => {
        let channel = args[0][0];
        let entry = this.getEntryForGuild(channel.guild);
        let reports = await this.getReportsChannel(channel.guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        reports.send(`${this.manager.CHANNEL} Channel ${bold(channel.name)} was deleted${displayServer ? ` in ${bold(channel.guild.name)}` : ``}.`);
    }

    shouldReport = (...args: any[]): boolean => {
        let channel: ChannelLike = args[0][0];
        let entry = this.getEntryForGuild(channel.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}