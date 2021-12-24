import { AuditorProbe } from '..';
import { Message } from 'discord.js';
import { mentionChannel } from '@ilefa/ivy';

export class MessageReactionRemoveAllProbe extends AuditorProbe {
    
    constructor() {
        super('Message Reaction Remove All', 'messageReactionRemoveAll');
    }
    
    report = async (...args: any[]) => {
        let message: Message = args[0][0];
        let reports = await this.getReportsChannel(message.guild);
        if (!reports)
            return;

        reports.send(`${this.manager.CHANNEL} All reactions were removed from a message in ${mentionChannel(message.channel.id)}.\n` 
                   + `${this.manager.DIVIDER} Original Message: https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`);
    }

    shouldReport = (...args: any[]): boolean => {
        let message: Message = args[0][0];
        let entry = this.getEntryForGuild(message.guild);
        if (!entry)
            return false;

        return entry.events.includes(this.eventType);
    }

}