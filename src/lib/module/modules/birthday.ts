import fs from 'fs';
import path from 'path';
import Module from '../module';
import scheduler from 'node-schedule';
import birthdays from '../../../../birthdays.json';

import * as Logger from '../../logger';

import { Job } from 'node-schedule';
import {
    Client,
    Guild,
    TextChannel,
    User
} from 'discord.js';

import {
    asMention,
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

    constructor(client: Client) {
        super('Birthdays');
        this.tasks = [];
        this.client = client;
    }

    start() {
        let start = Date.now();
        ((birthdays as any) as BirthdayGuild[]).map(guild => {
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
                channel.send(generateSimpleEmbed('Happy Birthday!', `${replaceAll(start, '%s', str)}`.replace(' is ', (users.length > 1 ? ' are ' : ' is '))));
            }));

            Logger.info(this.name, `Enabled in ${timeDiff(start)}ms.`);
        });
    }

    getAllBirthdays() {
        return (birthdays as any) as BirthdayGuild[];
    }

    getBirthdays(guild: string | Guild) {
        let id = guild instanceof Guild
            ? guild.id
            : guild;
            
        if (!id) {
            return null;
        }

        let repo = (birthdays as any) as BirthdayGuild[];
        return repo.find(g => g.guild === id);
    }

    getNextBirthday(guild: string | Guild) {
        let payload = this.getBirthdays(guild);
        if (!payload) {
            return null;
        }
        
        let closest = getClosestDate(new Date(), payload.records.map(record => new Date(record.date)));
        return payload
            .records
            .find(record => record.date === closest.getTime());
    }

    getBirthday(guild: string | Guild, user: string | User) {
        let birthdays = this.getBirthdays(guild);
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

    store(guild: string | Guild, user: string | User, date: number) {
        let payload = this.getBirthdays(guild);
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

        this.clean();
    }

    private clean() {
        let payload = this.getAllBirthdays();
        payload.forEach(p => {
            p.records = p
                .records
                .filter(record => record.users
                    && record.users.length)
        });

        if (payload !== this.getAllBirthdays()) {
            fs.writeFileSync(path.join(__dirname, '../../../../../', 'birthdays.json'), payload, {
                encoding: 'utf8',
                flag: 'w+'
            });
        }
    }

    end() {
        this.tasks.forEach(task => task.cancel());
    }

}