import Module from '../../module';
import env from '../../../../../env.json';

import { bold } from '../../../util';
import { CountHer } from './counther';
import { Client, Message, PermissionOverwrites, Permissions, TextChannel, User } from 'discord.js';

export default class CountHerManager extends Module {

    client: Client;
    countHers: CountHer[];

    constructor(client: Client) {
        super('CountHer');

        this.client = client;
        this.countHers = [];
    }

    start() {}
    end() {}

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

    /**
     * Destroys a lobby after someone fucks it up.
     * 
     * @param channel the channel the lobby is based in
     * @param loser the person who fucked it up
     */
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

    /**
     * Cleans up a lobby after a game has ended.
     * @param lobby the counther lobby
     */
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
        console.log(message);
        if (!this.isLobby(message.channel.id)) {
            console.log('trap 1');
            return;
        }
        
        let lobby = this.getLobby(message.channel.id);
        if (!lobby) {
            console.log('trap 2');
            return;
        }
        
        if (!lobby.active) {
            console.log('trap 3');
            return;
        }

        console.log('ok');
        await lobby.advance(message, message.content, message.author);
    }

    /**
     * Generates a channel for CountHer games.
     * 
     * @param message the message channel
     * @param user the user who sent the message
     */
    async generateChannel(message: Message, user: User, target: number): Promise<TextChannel> {
        let date = Date.now();
        return await message
            .guild
            .channels
            .create(`counther-${date
                .toString()
                .substring(date.toString().length - 4)}`, {
                    parent: env.countHerCategory,
                    topic: `CountHer Lobby | Count to ${target}`,
                    permissionOverwrites: [
                        {
                            allow: Permissions.FLAGS.SEND_MESSAGES + Permissions.FLAGS.VIEW_CHANNEL,
                            type: 'role',
                            id: '786736076852035595'
                        },
                        {
                            allow: Permissions.FLAGS.SEND_MESSAGES + Permissions.FLAGS.VIEW_CHANNEL + Permissions.FLAGS.ADD_REACTIONS,
                            type: 'member',
                            id: '759293931589599282'
                        },
                    ]
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