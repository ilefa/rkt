import { AuditorProbe } from '..';
import { PermissionString, Role } from 'discord.js';
import { bold, cond, GREEN_CIRCLE, RED_CIRCLE } from '@ilefa/ivy';

type PermissionWrapper = {
    status: PermissionStatus;
    permission: string;
}

enum PermissionStatus {
    ALLOW, DENY
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

export class RoleCreateProbe extends AuditorProbe {
    
    constructor() {
        super('Role Create', 'roleCreate');
    }
    
    report = async (...args: any[]) => {
        let role: Role = args[0][0];
        let entry = this.getEntryForGuild(role.guild);
        let reports = await this.getReportsChannel(role.guild);
        if (!reports)
            return;

        let perms = role.permissions.toArray();
        let allowed = this.wrapPermissions(perms, PermissionStatus.ALLOW);
        let denied = this.matchMissingPermissions(allowed);

        let allChanges = [...allowed, ...denied]
            .sort((a, b) => a.permission.localeCompare(b.permission))
            .sort((a, b) => a.status - b.status);

        let displayServer = entry.tracks.length !== 1;
        let changes = allChanges
            .map(ent => cond(ent.status === PermissionStatus.ALLOW, GREEN_CIRCLE, RED_CIRCLE) + ` ${ent.permission}`)
            .join('\n');

        reports.send(`${this.manager.ROLE} Role ${bold(role.name)} was created${displayServer ? ` in ${bold(role.guild.name)}` : ``}.\n${changes}`);
    }

    shouldReport = (...args: any[]): boolean => {
        let role: Role = args[0][0];
        let entry = this.getEntryForGuild(role.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

    private wrapPermissions = (entries: PermissionString[], status: PermissionStatus): PermissionWrapper[] => {
        return entries.map(permission => {
            return {
                status,
                permission: this.matchPermissionString(permission),
            }
        });
    }

    private matchPermissionString = (perm: PermissionString) => {
        return PermissionStrings.find(str => perm === str);
    }

    private matchMissingPermissions = (allowed: PermissionWrapper[]): PermissionWrapper[] => {
        return PermissionStrings
            .filter(elem => !allowed.some(ent => ent.permission === elem))
            .map(elem => {
                return {
                    status: PermissionStatus.DENY,
                    permission: elem
                }
            });
    }

}