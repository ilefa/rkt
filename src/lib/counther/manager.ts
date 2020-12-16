import env from '../../../env.json';

import { Client, Message, TextChannel, User } from 'discord.js';
import { CountHer } from './counther';
import { bold } from '../util';

export default class CountHerManager {

    client: Client;
    countHers: CountHer[];

    constructor(client: Client) {
        this.client = client;
        this.countHers = [];
    }

    /**
     * Creates a CountHer lobby in the provided channel.
     * 
     * @param channel the channel to create the lobby in
     * @param target the target number to count to
     */
    createLobby(channel: string, target: number): boolean {
        if (this.isLobby(channel)) {
            return false;
        }


        this.countHers.push(new CountHer(this.client, this, target, channel));
        return true;
    }

    async destroyLobby(channel: string, loser?: User) {
        if (!this.isLobby(channel)) {
            return;
        }

        this.countHers = this.countHers.filter(l => l.channel !== channel);
        (await this.client.channels.fetch(channel)).delete(`${loser ? loser.username + '#' + loser.discriminator + ' fucked it up' : 'the game has ended'}`)

        if (loser) {
            let channel = this.client.channels.cache.find(channel => channel.id === env.countHerFailChannel) as TextChannel;
            channel.send(`${bold(loser.username + '#' + loser.discriminator)}` + ' fucked it up.')
        }
    }

    async cleanLobby(lobby: CountHer) {
        if (!this.isLobby(lobby.channel)) {
            return;
        }

        lobby.active = false;
        this.countHers = this.countHers.filter(l => l.channel !== lobby.channel);
        (await this.client.channels.fetch(lobby.channel)).delete('the game has ended');

        let channel = this.client.channels.cache.find(channel => channel.id === env.countHerFailChannel) as TextChannel;
        channel.send(`${bold(`Lobby ${lobby.id}`)} won.`);
    }

    /**
     * Returns whether or not the given channel
     * is a registered CountHer lobby at this time.
     * 
     * @param channel the channel to check
     */
    isLobby(channel: string): boolean {
        return this.countHers.some(lobby => lobby.channel === channel);
    }

    /**
     * Returns a CountHer instance for the given
     * channel, if it exists.
     * 
     * @param channel the channel to retrieve
     */
    getLobby(channel: string): CountHer {
        return this.countHers.find(lobby => lobby.channel === channel);
    }

    /**
     * Returns whether the maximum amount of lobbies has been met.
     */
    isMaxed() {
        return this.countHers.length >= env.countHerMaxLobbies;
    }

    /**
     * Attempts to handle user input for a given channel.
     * 
     * @param channel the channel to handle
     * @param input the user provided input
     * @param user the user who sent the input
     */
    async handleInput(message: Message) {
        if (!this.isLobby(message.channel.id)) {
            return;
        }

        let lobby = this.getLobby(message.channel.id);
        if (!lobby) {
            return;
        }

        if (!lobby.active) {
            
            return;
        }

        await lobby.advance(message, message.content, message.author);
    }

    /**
     * Generates a channel for CountHer games.
     * 
     * @param message the message channel
     * @param user the user who sent the message
     */
    async generateChannel(message: Message, user: User, target: number): Promise<TextChannel> {
        return await message
            .guild
            .channels
            .create(`counther-${Date
                .now()
                .toString()
                .substring(0, 4)}`, {
                    parent: env.countHerCategory,
                    topic: `CountHer Lobby | Count to ${target}`
                });
    }

}

export class CountHerResponse {

    isSuccess: boolean;
    user: User;

    constructor(isSuccess: boolean = true, user: User = null) {
        this.isSuccess = isSuccess;
        this.user = user;
    }

}