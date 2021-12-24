import { AuditorProbe } from '..';
import { Role, VoiceState } from 'discord.js';
import { bold, mentionChannel } from '@ilefa/ivy';

enum VoiceStateCause {
    CONNECT,
    DISCONNECT,
    SWITCH_CHANNEL,
    SERVER_DEAF,
    SERVER_DEAF_OFF,
    SERVER_MUTE,
    SERVER_MUTE_OFF,
    STREAM,
    STREAM_OFF,
    UNKNOWN
}

export class VoiceStateUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Voice State Update', 'voiceStateUpdate');
    }
    
    report = async (...args: any[]) => {
        let a: VoiceState = args[0][0];
        let b: VoiceState = args[0][1];
        let entry = this.getEntryForGuild(b.guild);
        let reports = await this.getReportsChannel(b.guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        let cause = this.detectChange(a, b);
        let change = this.generateChangeMessage(a, b, cause, displayServer);
        if (!change)
            return;

        reports.send(change);
    }

    shouldReport = (...args: any[]): boolean => {
        let invite: Role = args[0][0];
        let entry = this.getEntryForGuild(invite.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

    private generateChangeMessage = (a: VoiceState, b: VoiceState, cause: VoiceStateCause, display: boolean) => {
        let end = display ? ` in ${bold(b.guild.name)}` : ``;
        if (cause == VoiceStateCause.UNKNOWN)
            return null;

        if (cause == VoiceStateCause.CONNECT)
            return `${this.manager.VOICE} ${bold(this.asName(a.member))} connected to ${mentionChannel(b.channel.id) + end}.`;

        if (cause == VoiceStateCause.DISCONNECT)
            return `${this.manager.VOICE} ${bold(this.asName(a.member))} disconnected from ${mentionChannel(a.channel.id) + end}.`;

        if (cause == VoiceStateCause.SWITCH_CHANNEL)
            return `${this.manager.VOICE} ${bold(this.asName(a.member))} switched from ${mentionChannel(a.channel.id)} to ${mentionChannel(b.channel.id) + end}.`;

        if (cause == VoiceStateCause.SERVER_DEAF)
            return `${this.manager.DEAFEN} ${bold(this.asName(a.member))} was server deafened${end}.`;

        if (cause == VoiceStateCause.SERVER_DEAF_OFF)
            return `${this.manager.UNDEAFEN} ${bold(this.asName(a.member))} is no longer server deafened${end}.`;

        if (cause == VoiceStateCause.SERVER_MUTE)
            return `${this.manager.MUTE} ${bold(this.asName(a.member))} was server muted${end}.`;

        if (cause == VoiceStateCause.SERVER_MUTE_OFF)
            return `${this.manager.UNMUTE} ${bold(this.asName(a.member))} is no longer server muted${end}.`;

        if (cause == VoiceStateCause.STREAM)
            return `${this.manager.STREAM} ${bold(this.asName(a.member))} started streaming to ${mentionChannel(a.channel.id) + end}.`;

        if (cause == VoiceStateCause.STREAM_OFF)
            return `${this.manager.STREAM} ${bold(this.asName(a.member))} stopped streaming to ${mentionChannel(a.channel.id) + end}.`;
    }

    private detectChange = (a: VoiceState, b: VoiceState) => {
        if (!a.channel && b.channel)
            return VoiceStateCause.CONNECT;
        
        if (a.channel && !b.channel)
            return VoiceStateCause.DISCONNECT;

        if (a.channel.id !== b.channel.id)
            return VoiceStateCause.SWITCH_CHANNEL;
            
        if (!a.serverDeaf && b.serverDeaf)
            return VoiceStateCause.SERVER_DEAF;

        if (a.serverDeaf && !b.serverDeaf)
            return VoiceStateCause.SERVER_DEAF_OFF;

        if (!a.serverMute && b.serverMute)
            return VoiceStateCause.SERVER_MUTE;

        if (a.serverMute && !b.serverMute)
            return VoiceStateCause.SERVER_MUTE_OFF;

        if (!a.streaming && b.streaming)
            return VoiceStateCause.STREAM;

        if (a.streaming && !b.streaming)
            return VoiceStateCause.STREAM_OFF;

        return VoiceStateCause.UNKNOWN;
    }

}