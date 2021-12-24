import { AuditorProbe } from '..';
import { GuildMember, Role } from 'discord.js';

import {
    bold,
    cond,
    emboss,
    GREEN_CIRCLE,
    numberEnding,
    RED_CIRCLE
} from '@ilefa/ivy';

enum MemberUpdateCause {
    ROLES,
    NICKNAME,
    NICKNAME_REMOVE,
    USERNAME,
    AVATAR,
    DELETED,
    UNKNOWN
}

enum RoleChangeStatus {
    ADD, REMOVE
}

type RolesWrapper = {
    status: RoleChangeStatus;
    role: Role;
}

export class GuildMemberUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Member Update', 'guildMemberUpdate');
    }
    
    report = async (...args: any[]) => {
        let a: GuildMember = args[0][0];
        let b: GuildMember = args[0][1];
        let entry = this.getEntryForGuild(b.guild);
        let reports = await this.getReportsChannel(b.guild);
        if (!reports)
            return;

        let cause = this.detectChange(a, b);
        let displayServer = entry.tracks.length !== 1;

        let change = this.generateChangeMessage(a, b, cause, displayServer);
        if (!change)
            return;

        reports.send(change);
    }

    shouldReport = (...args: any[]): boolean => {
        let b: GuildMember = args[0][1];
        let entry = this.getEntryForGuild(b.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

    private generateChangeMessage = (a: GuildMember, b: GuildMember, cause: MemberUpdateCause, display: boolean) => {
        let end = display ? ` in ${bold(b.guild.name)}` : ``;
        if (cause == MemberUpdateCause.UNKNOWN)
            return;
        
        if (cause == MemberUpdateCause.ROLES) {
            let rolesA = a.roles.cache.array();
            let rolesB = b.roles.cache.array();

            let added = this.wrapRoles(this.getDifferences(rolesA, rolesB), RoleChangeStatus.ADD);
            let removed = this.wrapRoles(this.getDifferences(rolesB, rolesA), RoleChangeStatus.REMOVE);
            let changes = added.length + removed.length;
            let allChanges = [...added, ...removed]
                .sort((a, b) => a.role.name.localeCompare(b.role.name))
                .sort((a, b) => a.status - b.status);

            return `${this.manager.MEMBERS} ${bold(`${changes} role${numberEnding(changes)}`)} ${cond(changes === 1, 'was', 'were')} modified for ${bold(this.asName(b)) + end}.\n` 
                    + allChanges
                        .map(ent => cond(ent.status === RoleChangeStatus.ADD, GREEN_CIRCLE, RED_CIRCLE) + ` ${ent.role.name}`)
                        .join('\n');
        }

        if (cause == MemberUpdateCause.NICKNAME)
            return `${this.manager.MEMBERS} Member ${bold(this.asName(b.user) + '\'s')} nickname was changed to ${emboss(b.nickname) + end}.`;

        if (cause == MemberUpdateCause.NICKNAME_REMOVE)
            return `${this.manager.MEMBERS} Member ${bold(this.asName(b.user) + '\'s')} nickname was removed${end}.`;

        if (cause == MemberUpdateCause.USERNAME)
            return `${this.manager.MEMBERS} Member ${bold(this.asName(a.user))} changed their name to ${bold(this.asName(b.user)) + end}.`;

        if (cause == MemberUpdateCause.AVATAR)
            return `${this.manager.MEMBERS} Member ${bold(this.asName(b.user))} changed their avatar.\n` 
                 + `${this.manager.DIVIDER} Old: ${emboss(a.user.avatar)}`
                 + `${this.manager.DIVIDER} New: ${emboss(b.user.avatar)}`;
    }
    
    private wrapRoles = (entries: Role[], status: RoleChangeStatus): RolesWrapper[] => {
        return entries.map(role => {
            return {
                status,
                role,
            }
        });
    }

    private getDifferences = (a: Role[], b: Role[]) => {
        return b.filter(elem => !a.some(val => val.id == elem.id));
    }

    private detectChange = (a: GuildMember, b: GuildMember) => {
        if (a.roles.cache.size !== b.roles.cache.size)
            return MemberUpdateCause.ROLES;
            
        if (!a.nickname && b.nickname)
            return MemberUpdateCause.NICKNAME;

        if (a.nickname && !b.nickname)
            return MemberUpdateCause.NICKNAME_REMOVE;

        if (a.user.username !== b.user.username)
            return MemberUpdateCause.USERNAME;

        if (a.user.avatar !== b.user.avatar)
            return MemberUpdateCause.AVATAR;

        return MemberUpdateCause.UNKNOWN;
    }

}