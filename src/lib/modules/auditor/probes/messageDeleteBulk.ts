import { AuditorProbe } from '..';
import { Collection, Message, Snowflake } from 'discord.js';

import {
    bold,
    mentionChannel,
    numberEnding,
    time
} from '@ilefa/ivy';

export class MessageDeleteBulkProbe extends AuditorProbe {
    
    constructor() {
        super('Message Delete Bulk', 'messageDeleteBulk');
    }
    
    report = async (...args: any[]) => {
        let collection: Collection<Snowflake, Message> = args[0][0];
        let messages = collection.array();
        let guild = messages[0].guild;
        let reports = await this.getReportsChannel(guild);
        if (!reports)
            return;

        let distinctChannels = [...new Set(messages.map(message => message.channel))];
        let channels = distinctChannels.map(channel => mentionChannel(channel.id)).join(', ');

        reports.send(`${this.manager.CHANNEL} ${bold(messages.length + ` message${numberEnding(messages.length)}`)} were deleted from ${channels}.\n` 
                   + messages
                        .map(message => `${this.manager.DIVIDER} ${bold(`[${message.id}]`)} created by ${bold(this.asName(message.author))} on ${bold(time(message.createdAt.getTime()))}`)
                        .join('\n'));
    }

    shouldReport = (...args: any[]): boolean => {
        let collection: Collection<Snowflake, Message> = args[0][0];
        let guild = collection.first().guild;
        let entry = this.getEntryForGuild(guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}