import { AuditorProbe } from '..';

import {
    Guild,
    NewsChannel,
    PermissionOverwrites,
    PermissionString,
    StoreChannel,
    TextChannel,
    VoiceChannel
} from 'discord.js';

import {
    bold,
    cond,
    emboss,
    getLatestTimeValue,
    GREEN_CIRCLE,
    mentionChannel,
    RED_CIRCLE,
} from '@ilefa/ivy';

type ChannelLike = TextChannel | VoiceChannel | NewsChannel | StoreChannel;

type PermissionOverwriteWrapper = {
    status: PermissionOverwriteStatus;
    permission: string;
}

enum PermissionOverwriteStatus {
    ALLOW, DENY
}

enum ChannelUpdateCause {
    NAME,
    TOPIC,
    NSFW,
    POSITION,
    SLOWMODE,
    CATEGORY,
    CATEGORY_PERM_SYNC,
    PERM_OVERRIDES,
    BITRATE,
    REGION, // apparently not in discord.js yet -- will be implemented once that is added
    UNKNOWN
}

const PermissionStrings = [
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'ADMINISTRATOR',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS',
    'VIEW_AUDIT_LOG',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'VIEW_GUILD_INSIGHTS',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS',
]

export class ChannelUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Channel Update', 'channelUpdate');
    }
    
    report = async (...args: any[]) => {
        let a: TextChannel = args[0][0];
        let b: TextChannel = args[0][1];
        let entry = this.getEntryForGuild(b.guild);
        let reports = await this.getReportsChannel(b.guild);
        if (!reports)
            return;

        let cause = this.detectChange(a, b);
        let displayServer = entry.tracks.length !== 1;

        reports.send(await this.generateChangeMessage(a, b, cause, displayServer));
    }

    shouldReport = (...args: any[]): boolean => {
        let channel: ChannelLike = args[0][0];
        let entry = this.getEntryForGuild(channel.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

    private generateChangeMessage = async (a: TextChannel | VoiceChannel, b: TextChannel | VoiceChannel, cause: ChannelUpdateCause, display: boolean) => {
        let end = display ? ` in ${bold(b.guild.name)}` : ``;
        if (cause == ChannelUpdateCause.UNKNOWN)
            return `${this.manager.CHANNEL} Channel ${bold(b.name)} (${mentionChannel(b.id)}) was somehow updated${end}.`;

        if (cause == ChannelUpdateCause.NAME)
            return `${this.manager.CHANNEL} Channel ${bold(a.name)} (${mentionChannel(b.id)}) was renamed to ${bold(b.name) + end}.`;
            
        if (a instanceof TextChannel && b instanceof TextChannel) {
            if (cause == ChannelUpdateCause.TOPIC)
                return `${this.manager.CHANNEL} Channel ${bold(b.name + '\'s')} (${mentionChannel(b.id)}) topic was updated to ${emboss(b.topic) + end}.`;

            if (cause == ChannelUpdateCause.NSFW)
                return `${this.manager.CHANNEL} Channel ${bold(b.name)} (${mentionChannel(b.id)}) is ${cond(b.nsfw, 'now', 'no longer')} marked NSFW${end}.`;

            if (cause == ChannelUpdateCause.SLOWMODE)
                return `${this.manager.CHANNEL} Channel ${bold(b.name + '\'s')} (${mentionChannel(b.id)}) slowmode ${cond(b.rateLimitPerUser === 0, 'was disabled', `is now ${bold(getLatestTimeValue(b.rateLimitPerUser * 1000))}`) + end}.`;
        }

        if (a instanceof VoiceChannel && b instanceof VoiceChannel) {
            if (cause == ChannelUpdateCause.BITRATE)
                return `${this.manager.CHANNEL} Channel ${bold(b.name + '\'s')} bitrate was set to ${bold((b as VoiceChannel).bitrate)}`;

            // if (cause == ChannelUpdateCause.REGION)
            //     return `${this.manager.CHANNEL} Channel ${bold(b.name + '\'s')} region was set to ${bold(b.region)}`;
        }
        
        if (cause == ChannelUpdateCause.POSITION)
            return `${this.manager.CHANNEL} Channel ${bold(b.name)} (${mentionChannel(b.id)}) was moved (now position ${b.rawPosition})${end}.`;

        if (cause == ChannelUpdateCause.CATEGORY)
            return `${this.manager.CHANNEL} Channel ${bold(b.name)} (${mentionChannel(b.id)}) was moved ${(!b.parent ? 'out of a category' : `to category ${bold(b.parent.name)}`) + end}.`;
        
        if (cause == ChannelUpdateCause.CATEGORY_PERM_SYNC)
            return `${this.manager.CHANNEL} Channel ${bold(b.name)} (${mentionChannel(b.id)}) ${cond(b.permissionsLocked, 'enabled', 'disabled')} category permission syncing${end}.`;

        if (cause == ChannelUpdateCause.PERM_OVERRIDES) {
            let diff = this.getDifferences(a.permissionOverwrites.array(), b.permissionOverwrites.array());
            let changes = '';

            for (let change of diff) {
                let role = change.type === 'role';
                let name = await this.getNameForChangedId(change.id, role, b.guild);
                let allowed = this.wrapOverwrites(change.allow.toArray(), PermissionOverwriteStatus.ALLOW);
                let denied = this.wrapOverwrites(change.deny.toArray(), PermissionOverwriteStatus.DENY);
                let allChanges = [...allowed, ...denied]
                    .sort((a, b) => a.permission.localeCompare(b.permission))
                    .sort((a, b) => a.status - b.status);

                changes += `${this.manager.MEMBERS + ' ' + bold(cond(name === '@everyone', 'everyone', name))}\n` 
                        + allChanges
                            .map(ent => cond(ent.status === PermissionOverwriteStatus.ALLOW, GREEN_CIRCLE, RED_CIRCLE) + ` ${ent.permission}`)
                            .join('\n');
            }

            return `${this.manager.CHANNEL} Channel ${bold(b.name + '\'s')} (${mentionChannel(b.id)}) permissions were updated${end}.\n${changes}`;
        }
    }

    private wrapOverwrites = (entries: PermissionString[], status: PermissionOverwriteStatus): PermissionOverwriteWrapper[] => {
        return entries.map(permission => {
            return {
                status,
                permission: this.matchPermissionString(permission),
            }
        });
    }

    private getDifferences = (a: PermissionOverwrites[], b: PermissionOverwrites[]) => {
        return b.filter(elem => !a.some(val => val.allow.bitfield == elem.allow.bitfield || val.deny.bitfield == elem.deny.bitfield));
    }

    private matchPermissionString = (perm: PermissionString) => {
        return PermissionStrings.find(str => perm === str);
    }

    private getNameForChangedId = async (id: string, role: boolean, guild: Guild) => {
        if (role) {
            let target = await this.client.guilds.fetch(guild!.id);
            let role = await target.roles.fetch(id);
            if (!role) return 'Unknown';

            return role.name;
        }

        let user = await this.client.users.fetch(id);
        if (!user) return 'Unknown';

        return this.asName(user);
    }
    
    private detectChange = (a: TextChannel | VoiceChannel, b: TextChannel | VoiceChannel) => {
        if (a.name !== b.name)
            return ChannelUpdateCause.NAME;

        if (!a.parent && b.parent || !b.parent && a.parent)
            return ChannelUpdateCause.CATEGORY;

        if ((a.parent && b.parent) && a.parent.id !== b.parent.id)
            return ChannelUpdateCause.CATEGORY;

        // causes a bunch of reports to be sent - so it is disabled for now
        // if (a.rawPosition !== b.rawPosition)
        //    return ChannelUpdateCause.POSITION;

        if (a.permissionsLocked !== b.permissionsLocked)
            return ChannelUpdateCause.CATEGORY_PERM_SYNC;
        
        if (a.permissionOverwrites !== b.permissionOverwrites)
            return ChannelUpdateCause.PERM_OVERRIDES;    

        if (a instanceof TextChannel && b instanceof TextChannel) {
            if (a.topic !== b.topic)
                return ChannelUpdateCause.TOPIC;
            
            if (a.nsfw !== b.nsfw)
                return ChannelUpdateCause.NSFW;            
            
            if (a.rateLimitPerUser !== b.rateLimitPerUser)
                return ChannelUpdateCause.SLOWMODE;            
            
            return ChannelUpdateCause.UNKNOWN;
        }

        if (a instanceof VoiceChannel && b instanceof VoiceChannel) {
            if (a.bitrate !== b.bitrate)
                return ChannelUpdateCause.BITRATE;
            
            // if (a.region !== b.region)
            //     return ChannelUpdateCause.REGION;

            return ChannelUpdateCause.UNKNOWN;
        }

        return ChannelUpdateCause.UNKNOWN;
    }

}