import { AuditorProbe } from '..';
import { bold, mentionChannel } from '@ilefa/ivy';
import { NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';

type ChannelLike = TextChannel | VoiceChannel | NewsChannel | StoreChannel;

export class ChannelPinsUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Channel Pins Update', 'channelPinsUpdate');
    }
    
    report = async (...args: any[]) => {
        let channel: TextChannel = args[0][0];
        let entry = this.getEntryForGuild(channel.guild);
        let reports = await this.getReportsChannel(channel.guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        reports.send(`${this.manager.PIN} Channel pins were updated for ${mentionChannel(channel.id) + (displayServer ? ` in ${bold(channel.guild.name)}` : ``)}.\n`);
    }

    shouldReport = (...args: any[]): boolean => {
        let channel: ChannelLike = args[0][0];
        let entry = this.getEntryForGuild(channel.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}