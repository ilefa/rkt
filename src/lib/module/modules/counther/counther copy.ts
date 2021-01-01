import { Client, Message, TextChannel, User } from 'discord.js';
import { CountHerResponse } from './manager';

export class CountHer {

    active: boolean;
    client: Client;
    countTo: number;
    channel: TextChannel;

    constructor(client: Client, countTo: number, channel: TextChannel) {
        this.active = true;
        this.countTo = countTo;
        this.channel = channel;
        this.client = client;
    }

    async advance(input: Message, user: User): Promise<CountHerResponse> {

        if (isNaN(parseFloat(input.content))) {
            await this.destroy(user);
            return new CountHerResponse(false, user);
        }
        let num = parseFloat(input.content);
        let lastMsg = await this.getLast(this.channel);
        if (input.id == lastMsg.id) {
            if(num == 1) return new CountHerResponse();
            else {
                await this.destroy(user);
                return new CountHerResponse(false, user);
            }
        }
        if (isNaN(parseFloat(lastMsg.content))) {
            let next = await this.getMessage(this.channel, 3);
            if (isNaN(parseFloat(next.content))) {
                await this.destroy();
                return new CountHerResponse(false);
            } else {
                lastMsg = next;
            }
        }
        if (num !== parseFloat(lastMsg.content) + 1) {
            await this.destroy(user);
            return new CountHerResponse(false, user);
        }
        if (num >= this.countTo) {
            this.destroy();
        }
        return new CountHerResponse();
    }

    async destroy(user?: User): Promise<void> {
        this.active = false;
        
        await this.channel.delete(`${user ? user.username + '#' + user.discriminator + ' fucked it up' : 'the game has ended'}`)
    }

    async getLast(channel: TextChannel): Promise<Message> {
        return await this.getMessage(channel, 2);
    }
    
    async getMessage(channel: TextChannel, num: number): Promise<Message> {
        return await channel.messages.fetch({limit: num}).then(res => {
            return res.last();
        })
    }
}