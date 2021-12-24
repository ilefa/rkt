import { AuditorProbe } from '..';
import { PermissionString, Role } from 'discord.js';
import { bold, cond, GREEN_CIRCLE, RED_CIRCLE } from '@ilefa/ivy';

type PermissionWrapper = {
    status: PermissionStatus;
    permission: string;
}

enum RoleUpdateCause {
    NAME,
    COLOR,
    PERMISSIONS,
    UNKNOWN
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

export class RoleUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Role Update', 'roleUpdate');
    }
    
    report = async (...args: any[]) => {
        let a: Role = args[0][0];
        let b: Role = args[0][1];
        let entry = this.getEntryForGuild(b.guild);
        let reports = await this.getReportsChannel(b.guild);
        if (!reports)
            return;

        let displayServer = entry.tracks.length !== 1;
        let cause = this.detectChange(a, b);
        let message = this.generateChangeMessage(a, b, cause, displayServer);
        if (!message)
            return;

        reports.send(message);
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

    private getDifferences = (a: PermissionString[], b: PermissionString[]) => {
        return b.filter(elem => !a.some(val => val === elem));
    }

    private generateChangeMessage = (a: Role, b: Role, cause: RoleUpdateCause, display: boolean) => {
        let end = display ? ` in ${bold(b.guild.name)}` : ``;
        if (cause == RoleUpdateCause.UNKNOWN)
            return null;

        if (cause == RoleUpdateCause.NAME)
            return `${this.manager.ROLE} Role ${bold(a.name)} was renamed to ${bold(b.name) + end}.`;

        if (cause == RoleUpdateCause.COLOR)
            return `${this.manager.ROLE} Role ${bold(b.name)} is now colored ${bold(b.hexColor) + end}.`;

        let permA = a.permissions.toArray();
        let permB = b.permissions.toArray();
        let added = this.wrapPermissions(this.getDifferences(permA, permB), PermissionStatus.ALLOW);
        let removed = this.wrapPermissions(this.getDifferences(permB, permA), PermissionStatus.DENY);

        let allChanges = [...added, ...removed]
            .sort((a, b) => a.permission.localeCompare(b.permission))
            .sort((a, b) => a.status - b.status);

        return `${this.manager.ROLE} Role ${bold(b.name) + '\'s'} permissions were updated${end}.\n` 
              + allChanges
                    .map(ent => cond(ent.status === PermissionStatus.ALLOW, GREEN_CIRCLE, RED_CIRCLE) + ` ${ent.permission}`)
                    .join('\n')
    }

    private detectChange = (a: Role, b: Role) => {
        if (a.name !== b.name)
            return RoleUpdateCause.NAME;

        if (a.color !== b.color)
            return RoleUpdateCause.COLOR;

        if (a.permissions.bitfield !== b.permissions.bitfield)
            return RoleUpdateCause.PERMISSIONS;

        return RoleUpdateCause.UNKNOWN;
    }

}