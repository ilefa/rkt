import Module from '../module';
import scheduler from 'node-schedule';
import env from '../../../../env.json';

import * as Logger from '../../logger';

import { Job } from 'node-schedule';
import { timeDiff } from '../../util';
import { Client, MessageEmbed } from 'discord.js';

export default class Announcer extends Module {

    tasks: Job[];
    client: Client;

    constructor (client: Client) {
        super('Announcer');
        
        this.client = client;
        this.tasks = [];
    }   

    start() {
        let start = Date.now();
        env.schedules.forEach(schedule => {
            this.tasks.push(scheduler.scheduleJob(schedule.cron, async () => {
                if (!env.alerts) {
                    return;
                }
                
                let guild = this.client.guilds.cache.get(env.alertsServer);
                if (!guild) {
                    return;
                }
            
                let channel: any = guild.channels.cache.get(env.alertsChannel);
                let message = new MessageEmbed()
                    .setTitle(schedule.name)
                    .setColor(0x27AE60)
                    .setDescription(schedule.message)
            
                channel.send(`<@&${env.alertsRoleId}>`)
                channel.send(message);
            }));
        });

        Logger.info('Announcer', `Enabled in ${timeDiff(start)}ms.`);
    }

    end() {
        this.tasks.forEach(task => task.cancel());
        this.tasks = [];
    }

}