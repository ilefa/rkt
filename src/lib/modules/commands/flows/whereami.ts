import { codeBlock, TestCommand } from '@ilefa/ivy';
import { DMChannel, GuildChannel, Message, TextChannel } from 'discord.js';

export class WhereAmIFlow extends TestCommand {

    constructor() {
        super('whereami');
    }

    run(message?: Message) {
        let metadata = message.channel;
        let channelName = metadata instanceof GuildChannel
                ? '#' + (metadata as TextChannel).name 
                : metadata instanceof DMChannel 
                    ? '@' + (metadata as DMChannel).recipient.username 
                    : 'unknown';

        message.channel.send(codeBlock('', channelName));        
    }

}