import fs from 'fs';
import path from 'path';
import Module from '../module';
import scheduler from 'node-schedule';
import repo from '../../../../birthdays.json';

import * as Logger from '../../logger';

import { Job } from 'node-schedule';
import { Client, Guild, TextChannel, User } from 'discord.js';

import {
    asMention,
    EmbedIconType,
    generateSimpleEmbed,
    getClosestDate,
    join,
    replaceAll,
    timeDiff
} from '../../util';

type BirthdayGuild = {
    guild: string;
    channel: string;
    schedule: string;
    messages: string[];
    records: BirthdayRecord[];
}

type BirthdayRecord = {
    date: number;
    users: string[];
}

export default class BirthdayManager extends Module {
    
    tasks: Job[];
    client: Client;
    birthdays: BirthdayGuild[];

    constructor(client: Client) {
        super('Birthdays');
        this.tasks = [];
        this.client = client;
        this.birthdays = (repo as any) as BirthdayGuild[];
    }

    start() {
        let start = Date.now();
        this.birthdays.map(guild => {
            Logger.info(this.name, `Activated task for ${guild.guild} with schedule [${guild.schedule}]`);
            this.tasks.push(scheduler.scheduleJob(guild.schedule, async () => {
                let date = new Date();
                let record = guild
                    .records
                    .find(d => new Date(d.date).getDate() == date.getDate() 
                            && new Date(d.date).getMonth() == date.getMonth());
    
                if (!record
                    || !record.users
                    || !record.users.length) {
                        return;
                }
    
                let channel = await this.client.channels.fetch(guild.channel, true) as TextChannel;
                if (!channel) {
                    return;
                }

                let users = await Promise
                    .all(record
                        .users
                        .map(async id => await this
                            .client
                            .users
                            .fetch(id, true)));

                let str = join(users, ', ', user => asMention(user.id) + ', ');
                str = str.substring(0, str.length - 2).replace(/\,(?!.*\,)/, " and");

                let start = guild.messages[Math.floor(Math.random() * guild.messages.length)];
                channel.send(generateSimpleEmbed('Happy Birthday!', EmbedIconType.BIRTHDAY, `${replaceAll(start, '%s', str)}`.replace(' is ', (users.length > 1 ? ' are ' : ' is '))));
            }));
        });

        Logger.info(this.name, `Enabled in ${timeDiff(start)}ms.`);
    }

    async getAllBirthdays() {
        let records = (await import('../../../../birthdays.json') as any).default as BirthdayGuild[];
        this.birthdays = records;
        return records;
    }

    async getBirthdays(guild: string | Guild) {
        let id = guild instanceof Guild
            ? guild.id
            : guild;
            
        if (!id) {
            return null;
        }

        let repo = await this.getAllBirthdays();
        return repo.find(g => g.guild === id);
    }

    async getChannel(guild: string | Guild) {
        let id = guild instanceof Guild
            ? guild.id
            : guild;
            
        if (!id) {
            return null;
        }

        let repo = await this.getAllBirthdays();
        let record = repo.find(g => g.guild === id);
        
        return this
            .client
            .channels
            .cache
            .find(channel => channel.id === record.channel);
    }

    async getSchedule(guild: string | Guild) {
        let id = guild instanceof Guild
            ? guild.id
            : guild;
            
        if (!id) {
            return null;
        }

        let repo = await this.getAllBirthdays();
        let record = repo.find(g => g.guild === id);
        return record.schedule;
    }

    getMessages(guild: string | Guild) {
        let id = guild instanceof Guild
            ? guild.id
            : guild;
            
        if (!id) {
            return null;
        }

        let repo = (this.birthdays as any) as BirthdayGuild[];
        return repo.find(g => g.guild === id)?.messages;
    }

    async getNextBirthday(guild: string | Guild) {
        let payload = await this.getBirthdays(guild);
        if (!payload) {
            return null;
        }
        
        let closest = getClosestDate(new Date(), payload.records.map(record => new Date(record.date)));
        return payload
            .records
            .find(record => record.date === closest.getTime());
    }

    async getBirthday(guild: string | Guild, user: string | User) {
        let birthdays = await this.getBirthdays(guild);
        if (!birthdays) {
            return null;
        }

        return birthdays
            .records
            .find(record => record
                .users
                .includes(user instanceof User 
                    ? user.id 
                    : user));
    }

    async store(guild: string | Guild, user: string | User, date: number) {
        let payload = await this.getBirthdays(guild);
        if (!payload) {
            return null;
        }

        let record = payload.records.find(record => {
            let local = new Date(record.date);
            let remote = new Date(date);
            
            return local.getDate() === remote.getDate() 
                && local.getMonth() === remote.getMonth();
        });

        if (!record) {
            record = {
                date,
                users: []
            }
        }

        record.users.push(user instanceof User
            ? user.id
            : user);

        fs.writeFileSync(path.join(__dirname, '../../../../../', 'birthdays.json'), record, {
            encoding: 'utf8',
            flag: 'w+'
        });

        await this.save();
    }

    async setChannel(guild: string | Guild, channel: string | TextChannel) {
        let payload = await this.getBirthdays(guild);
        if (!payload) {
            return null;
        }

        payload.channel = channel instanceof TextChannel ? channel.id : channel;

        fs.writeFileSync(path.join(__dirname, '../../../../../', 'birthdays.json'), payload, {
            encoding: 'utf8',
            flag: 'w+'
        });

        await this.save();
    }

    async setMessages(guild: string | Guild, messages: string[]) {
        let payload = await this.getBirthdays(guild);
        if (!payload) {
            return null;
        }

        payload.messages = messages;
        
        fs.writeFileSync(path.join(__dirname, '../../../../../', 'birthdays.json'), payload, {
            encoding: 'utf8',
            flag: 'w+'
        });

        await this.save();
    }

    async setSchedule(guild: string | Guild, schedule: string) {
        let payload = await this.getBirthdays(guild);
        if (!payload) {
            return null;
        }

        payload.schedule = schedule;
        
        fs.writeFileSync(path.join(__dirname, '../../../../../', 'birthdays.json'), payload, {
            encoding: 'utf8',
            flag: 'w+'
        });

        await this.save();
    }

    async save() {
        let payload = await this.getAllBirthdays();
        fs.writeFileSync(path.join(__dirname, '../../../../../', 'birthdays.json'), payload, {
            encoding: 'utf8',
            flag: 'w+'
        });
    }

    end() {
        this.tasks.forEach(task => task.cancel());
    }

}