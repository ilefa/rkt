import { AuditorProbe } from '..';
import { Guild, GuildFeatures } from 'discord.js';

import {
    bold,
    cond,
    emboss,
    getLatestTimeValue,
    GREEN_CIRCLE,
    italic,
    mentionChannel,
    numberEnding,
    RED_CIRCLE
} from '@ilefa/ivy';

enum GuildUpdateCause {
    NAME,
    ICON,
    AFK_CHANNEL,
    AFK_TIMEOUT,
    REGION,
    SYSTEM_CHANNEL,
    WELCOME_MESSAGE,
    BOOST_MESSAGE,
    NOTIFICATIONS,
    GUILD_FEATURES,
    VERIFICATION_LEVEL,
    MEDIA_FILTER,
    MFA_REQUIREMENT,
    WIDGET_STATUS,
    WIDGET_CHANNEL,
    RULES_CHANNEL,
    UPDATES_CHANNEL,
    PRIMARY_LANGUAGE,
    SERVER_DESCRIPTION,
    BANNER,
    DISCOVERY_IMAGE,
    SPLASH_IMAGE,
    OWNER_CHANGE,
    VANITY_URL,
    VERIFIED,
    UNKNOWN
}

enum FeatureChangeStatus {
    ADD, REMOVE
}

enum VerificationLevels {
    NONE = '<:offline:808585033890791424>',
    LOW = '<:blue:836447279782297640>',
    MEDIUM = '<:online:808585033899966464>',
    HIGH = '<:idle:808585033908224010>',
    VERY_HIGH = '<:dnd:808585033991585802>'
}

enum MediaFilterNames {
    DISABLED = 'Disabled',
    MEMBERS_WITHOUT_ROLES = 'Members without Roles',
    ALL_MEMBERS = 'All Members'
}

enum MfaLevelNames {
    NONE = 'No MFA Requirement',
    ELEVATED = 'MFA Requirement for Staff'
}

type FeatureWrapper = {
    status: FeatureChangeStatus;
    feature: GuildFeatures;
}

export class GuildUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Guild Update', 'guildUpdate');
    }
    
    report = async (...args: any[]) => {
        let a: Guild = args[0][0];
        let b: Guild = args[0][1];
        let reports = await this.getReportsChannel(b);
        if (!reports)
            return;

        reports.send(this.generateChangeMessage(a, b, this.detectChange(a, b)));
    }

    shouldReport = (...args: any[]): boolean => {
        let b: Guild = args[0][1];
        let entry = this.getEntryForGuild(b);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

    private generateChangeMessage = (a: Guild, b: Guild, cause: GuildUpdateCause) => {
        if (cause == GuildUpdateCause.UNKNOWN)
            return `${this.manager.COG} ${bold(b.name)} was somehow updated.`;
        
        if (cause == GuildUpdateCause.NAME)
            return `${this.manager.COG} ${bold(a.name)} was renamed to ${bold(b.name)}.`;

        if (cause == GuildUpdateCause.ICON)
            return `${this.manager.COG} ${bold(b.name + '\'s')} icon was changed.\n` 
                 + `${this.manager.DIVIDER} Old: ${emboss(a.icon)}\n` 
                 + `${this.manager.DIVIDER} New: ${emboss(b.icon)}`;

        if (cause == GuildUpdateCause.AFK_CHANNEL)
            return `${this.manager.COG} AFK channel for ${bold(b.name)} ${!!b.afkChannel ? 'is now ' + mentionChannel(b.afkChannelID) : 'was unset'}.`;

        if (cause == GuildUpdateCause.AFK_TIMEOUT)
            return `${this.manager.COG} AFK timeout for ${bold(b.name)} ${!!b.afkChannel ? 'is now ' + bold(getLatestTimeValue(b.afkTimeout * 1000)) : 'was unset'}.`;

        if (cause == GuildUpdateCause.REGION)
            return `${this.manager.COG} Region for ${bold(b.name)} is now ${bold(b.region)}.`;

        if (cause == GuildUpdateCause.SYSTEM_CHANNEL)
            return `${this.manager.COG} System channel for ${bold(b.name)} ${!!b.systemChannel ? 'is now ' + mentionChannel(b.systemChannelID) : 'was unset'}.`;

        if (cause == GuildUpdateCause.WELCOME_MESSAGE)
            return `${this.manager.MENTION} Welcome messages were ${cond(b.systemChannelFlags.has('WELCOME_MESSAGE_DISABLED'), 'disabled', 'enabled')} for ${bold(b.name)}.`;

        if (cause == GuildUpdateCause.BOOST_MESSAGE)
            return `${this.manager.MENTION} Boost messages were ${cond(b.systemChannelFlags.has('BOOST_MESSAGE_DISABLED'), 'disabled', 'enabled')} for ${bold(b.name)}.`;

        if (cause == GuildUpdateCause.NOTIFICATIONS)
            return `${this.manager.MENTION} The default notifications option for ${bold(b.name)} is now ${bold(cond(b.defaultMessageNotifications === 'ALL', 'All', 'Mentions Only'))}.`;

        if (cause == GuildUpdateCause.GUILD_FEATURES) {
            let old = a.features;
            let cur = b.features;
            let diff = this.getDifferences(old, cur);
            let added = this.wrapRoles(this.getDifferences(cur, old), FeatureChangeStatus.ADD);
            let removed = this.wrapRoles(diff, FeatureChangeStatus.REMOVE);

            let allChanges = [...added, ...removed]
                .sort((a, b) => a.feature.localeCompare(b.feature))
                .sort((a, b) => a.status - b.status);

            return `${this.manager.COG} ${bold(`${diff.length} feature${numberEnding(diff.length)}`)} were altered for ${bold(b.name)}.\n` 
                    + allChanges
                        .map(ent => 
                            cond(ent.status === FeatureChangeStatus.ADD, GREEN_CIRCLE, RED_CIRCLE) + ` ${ent.feature}`)
                        .join('\n');

        }

        if (cause == GuildUpdateCause.VERIFICATION_LEVEL)
            return `${this.manager.COG} Verification level for ${bold(b.name)} is now ${bold(b.verificationLevel)}.`;

        if (cause == GuildUpdateCause.MEDIA_FILTER)
            return `${this.manager.COG} Media filtering for ${bold(b.name)} will now be done for ${bold(MediaFilterNames[b.explicitContentFilter])}.`;

        if (cause == GuildUpdateCause.MFA_REQUIREMENT)
            return `${this.manager.COG} ${bold(b.name)} now has ${b.mfaLevel === 1 ? 'a' : ''} ${bold(MfaLevelNames[b.mfaLevel])}`;

        if (cause == GuildUpdateCause.WIDGET_STATUS)
            return `${this.manager.WIDGET} Server Widget for ${bold(b.name)} has been ${bold(cond(b.widgetEnabled, 'enabled', 'disabled'))}.`;

        if (cause == GuildUpdateCause.WIDGET_CHANNEL)
            return `${this.manager.WIDGET} Server Widget Channel for ${bold(b.name)} ${!!b.widgetChannel ? 'is now ' + mentionChannel(b.widgetChannelID) : 'was unset'}.`;

        if (cause == GuildUpdateCause.RULES_CHANNEL)
            return `${this.manager.COG} Rules channel for ${bold(b.name)} is now ${mentionChannel(b.rulesChannelID)}.`;

        if (cause == GuildUpdateCause.UPDATES_CHANNEL)
            return `${this.manager.COG} Community Updates channel for ${bold(b.name)} is now ${mentionChannel(b.publicUpdatesChannelID)}.`;

        if (cause == GuildUpdateCause.PRIMARY_LANGUAGE)
            return `${this.manager.COG} Server Locale for ${bold(b.name)} is now ${bold(b.preferredLocale)}.`;

        if (cause == GuildUpdateCause.SERVER_DESCRIPTION)
            return `${this.manager.COG} Server Description for ${bold(b.name)} was changed to ${emboss(b.description)}.`;

        if (cause == GuildUpdateCause.BANNER)
            return `${this.manager.COG} Server Banner for ${bold(b.name)} was updated.\n` 
                 + !!a.banner ? `${this.manager.DIVIDER} Old: ${emboss(a.banner)}\n` : ''
                 + `${this.manager.DIVIDER} ${!!a.banner ? 'New' : 'Banner'}: ${emboss(b.banner)}`;

        if (cause == GuildUpdateCause.DISCOVERY_IMAGE)
            return `${this.manager.COG} Discovery Splash Image for ${bold(b.name)} was updated.\n` 
                 + !!a.discoverySplash ? `${this.manager.DIVIDER} Old: ${emboss(a.discoverySplash)}\n` : ''
                 + `${this.manager.DIVIDER} ${!!a.discoverySplash ? 'New' : 'Splash Image'}: ${emboss(b.discoverySplash)}`;

        if (cause == GuildUpdateCause.SPLASH_IMAGE)
            return `${this.manager.COG} Invite Splash Image for ${bold(b.name)} was updated.\n` 
                 + !!a.splash ? `${this.manager.DIVIDER} Old: ${emboss(a.splash)}\n` : ''
                 + `${this.manager.DIVIDER} ${!!a.splash ? 'New' : 'Splash Image'}: ${emboss(b.splash)}`;

        if (cause == GuildUpdateCause.OWNER_CHANGE)
            return `${this.manager.COG} ${bold(b.name)} is now owned by ${bold(this.asName(b.owner))}.`;

        if (cause == GuildUpdateCause.VANITY_URL)
            return `${this.manager.COG} Vanity URL for ${bold(b.name)} was updated.\n` 
                 + !!a.vanityURLCode ? `${this.manager.DIVIDER} Old: ${emboss('discord.gg/' + a.vanityURLCode)}\n` : ''
                 + `${this.manager.DIVIDER} ${!!a.vanityURLCode ? 'New' : 'Vanity URL'}: ${emboss('discord.gg/' + b.vanityURLCode)}`;

        if (cause == GuildUpdateCause.VERIFIED)
            return `${this.manager.VERIFIED} ${bold(b.name)} is ${cond(b.verified, 'now', 'no longer')} verified. ${b.verified ? italic('(Woohoo!)') : ''}`;

    }

    private wrapRoles = (entries: GuildFeatures[], status: FeatureChangeStatus): FeatureWrapper[] => {
        return entries.map(feature => {
            return {
                status,
                feature,
            }
        });
    }

    private getDifferences = (a: GuildFeatures[], b: GuildFeatures[]) => {
        return b.filter(elem => !a.some(val => val == elem));
    }

    private detectChange = (a: Guild, b: Guild) => {
        if (a.name !== b.name)
            return GuildUpdateCause.NAME;

        if (a.icon !== b.icon)
            return GuildUpdateCause.ICON;

        if (a.afkChannelID !== b.afkChannelID)
            return GuildUpdateCause.AFK_CHANNEL;

        if (a.afkTimeout !== b.afkTimeout)
            return GuildUpdateCause.AFK_TIMEOUT;

        if (a.region !== b.region)
            return GuildUpdateCause.REGION;

        if (a.systemChannelID !== b.systemChannelID)
            return GuildUpdateCause.SYSTEM_CHANNEL;

        if (a.systemChannelFlags.bitfield !== b.systemChannelFlags.bitfield) {
            if (a.systemChannelFlags.has('BOOST_MESSAGE_DISABLED') !== b.systemChannelFlags.has('BOOST_MESSAGE_DISABLED'))
                return GuildUpdateCause.BOOST_MESSAGE;

            if (a.systemChannelFlags.has('WELCOME_MESSAGE_DISABLED') !== b.systemChannelFlags.has('WELCOME_MESSAGE_DISABLED'))
                return GuildUpdateCause.WELCOME_MESSAGE;
        }

        if (a.defaultMessageNotifications !== b.defaultMessageNotifications)
            return GuildUpdateCause.NOTIFICATIONS;

        if (b.features.some(val => !a.features.includes(val)))
            return GuildUpdateCause.GUILD_FEATURES;

        if (a.verificationLevel !== b.verificationLevel)
            return GuildUpdateCause.VERIFICATION_LEVEL;

        if (a.explicitContentFilter !== b.explicitContentFilter)
            return GuildUpdateCause.MEDIA_FILTER;

        if (a.mfaLevel !== b.mfaLevel)
            return GuildUpdateCause.MFA_REQUIREMENT;

        if (a.widgetEnabled !== b.widgetEnabled)
            return GuildUpdateCause.WIDGET_STATUS;

        if (a.widgetChannelID !== b.widgetChannelID)
            return GuildUpdateCause.WIDGET_CHANNEL;

        if (a.rulesChannelID !== b.rulesChannelID)
            return GuildUpdateCause.RULES_CHANNEL;

        if (a.publicUpdatesChannelID !== b.publicUpdatesChannelID)
            return GuildUpdateCause.UPDATES_CHANNEL;

        if (a.preferredLocale !== b.preferredLocale)
            return GuildUpdateCause.PRIMARY_LANGUAGE;

        if (a.description !== b.description)
            return GuildUpdateCause.SERVER_DESCRIPTION;

        if (a.banner !== b.banner)
            return GuildUpdateCause.BANNER;

        if (a.discoverySplash !== b.discoverySplash)
            return GuildUpdateCause.DISCOVERY_IMAGE;

        if (a.splash !== b.splash)
            return GuildUpdateCause.SPLASH_IMAGE;

        if (a.ownerID !== b.ownerID)
            return GuildUpdateCause.OWNER_CHANGE;

        if (a.vanityURLCode !== b.vanityURLCode)
            return GuildUpdateCause.VANITY_URL;

        if (a.verified !== b.verified)
            return GuildUpdateCause.VERIFIED;

        return GuildUpdateCause.UNKNOWN;
    }

}