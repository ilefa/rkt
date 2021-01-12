import fs from 'fs';
import path from 'path';
import Module from '../../module';
import env from '../../../../../env.json';
import board from '../../../../../stonkboard.json';

import { StonkboardRepository, StonkboardUser } from './struct';

import {
    Client,
    Message,
    MessageReaction,
    User
} from 'discord.js';

const repoFile = path.join(__dirname, '../../../../../', 'stonkboard.json');

export default class StonkBoardManager extends Module {

    client: Client;

    constructor(client: Client) {
        super('Stonkboard');
        this.client = client;
    }

    start() {}

    end() {}

    async handle(reaction: MessageReaction) {
        let { count, emoji, message } = reaction;
        let id = emoji.id 
            ? emoji.id 
            : emoji.name;

        if (id !== env.starboardEmote) {
            return;
        }

        if (count < env.starboardLimit) {
            return;
        }

        if (this.isOnBoard(message)) {
            return;
        }

        this.store(message);
    }

    getRepository(): StonkboardRepository {
        return (board as any) as StonkboardRepository;
    }

    getUser(user: User | string): StonkboardUser {
        return this
            .getRepository()
            .users
            .find(user => user.id === (user instanceof User 
                ? user.id 
                : user));
    }

    private async isOnBoard(message: Message) {
        return board
            .records
            .some(record => record.id === message.id);
    }

    private async store(message: Message) {
        let repo = this.getRepository();
        repo.records.push({
            message: {
                id: message.id,
                author: message.author.id,
                creation: String(message.createdAt.getTime())
            },
            time: String(Date.now())
        });

        let user = await this.incrementXp(message, message.author);
        repo.users[repo.users.findIndex((u)=> u.id === user.id)] = user;
        fs.writeFileSync(repoFile, repo, {
            encoding: 'utf8',
            'flag': 'w+'
        }); 
    }

    private async incrementXp(message: Message, user: User): Promise<StonkboardUser> {
        let u = this.getUser(user);
        if (!u) {
            return {
                id: user.id,
                exp: 1,
                level: 0
            }
        }

        let required = this.getRequiredXp(u.level);
        let gain = this.getXpGained(5, message.createdAt, new Date());
        u.exp += gain;

        if (u.exp >= required) {
            u.level += 1;
            u.exp = Math.max(0, u.exp - required);
        }

        return u;
    }

    private getRequiredXp(level: number) {
        if (level <= 5) return 25 + (2 * level);
        if (level <= 10) return 20 * level - 18;
        return 33 * level - 38; 
    }

    private getXpGained(base: number, creation: Date, achieved: Date) {
        return ((achieved.getTime() - creation.getTime()) / 10000) / base;
    }

}