import { AuditorProbe } from '..';
import { Message } from 'discord.js';
import { bold, codeBlock, conforms, mentionChannel } from '@ilefa/ivy';

export class MessageUpdateProbe extends AuditorProbe {
    
    constructor() {
        super('Message Update', 'messageUpdate');
    }
    
    report = async (...args: any[]) => {
        let message: Message = args[0][0];
        let reports = await this.getReportsChannel(message.guild);
        if (!reports)
            return;

        // i'm pretty sure the only way a message can be updated is if it was edited
        reports.send(`${this.manager.CHANNEL} Message in ${mentionChannel(message.channel.id)} (${'#' + (message.edits.length - 1)}) was edited by ${bold(this.asName(message.author))}.\n` 
                   + `${this.manager.DIVIDER} Message Link: https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}\n` 
                   + `${this.manager.DIVIDER} Original Content:`);
                   
        // make sure the message can fit in the code block
        reports.send(codeBlock(message.content.length === 2000
            ? message.content.substring(0, message.content.length - 9)
            : message.content, ''));
    }

    shouldReport = (...args: any[]): boolean => {
        let message: Message = args[0][0];
        let entry = this.getEntryForGuild(message.guild);
        if (!entry)
            return false;

        if (!message.author
            || message.author.bot
            || message.type !== 'DEFAULT'
            || !message.content
            || message.attachments.some(attachment => conforms(/^http(?:s){0,}:\/{2}(?:giphy.com|tenor.com|kapwing.com|imgflip.com|gifsoup.com|imgplay|senorgif.com)/, attachment.url))
            || conforms(/^\.\w+(?:\s.+){0,}/, message.content))
        return false;


        return entry.events.includes(this.eventType);
    }

}