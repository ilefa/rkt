import CountHerManager from './manager';
import { Client, Message, TextChannel, User } from 'discord.js';

export class CountHer {

    id: string;
    client: Client;
    manager: CountHerManager;
    countTo: number;
    current: number;
    channel: string;
    lastUser: string;
    active: boolean;

    constructor(client: Client, manager: CountHerManager, countTo: number, channel: string) {
        let date = Date.now().toString();
        this.id = date.substring(date.length - 4);
        this.countTo = countTo;
        this.current = 0;
        this.channel = channel;
        this.lastUser = null;
        this.client = client;
        this.manager = manager;
        this.active = true;
    }

    async advance(message: Message, input: string, user: User): Promise<void> {
        if (user.id === this.lastUser) {
            await message.delete();
            return;
        }

        if (isNaN(parseFloat(input))) {
            return await this.manager.destroyLobby(message.channel.id, user);
        }

        let num = parseFloat(input);
        if (num !== this.current + 1) return await this.manager.destroyLobby(message.channel.id, user);
        if (num >= this.countTo) return await this.manager.cleanLobby(this);

        this.current = num;
        this.lastUser = user.id;
        message.react('<:onlygoesup:786296476757524490>');
    }

    async getLast(channel: TextChannel): Promise<Message> {
        return await channel.messages.fetch({limit: 2}).then(res => {
            return res.last();
        })
    }
    
}