import env from '../../env.json';
import scheduler from 'node-schedule';

import * as Logger from './logger';

import { Client, MessageEmbed } from 'discord.js';
import { timeDiff } from './util';

export default class Announcer {

    client: Client;

    constructor (client) {
        this.client = client;
    }   

    init() {
        let start = Date.now();
        env.schedules.forEach(schedule => scheduler.scheduleJob(schedule.cron, async () => {
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

        Logger.info('Announcer', `Enabled in ${timeDiff(start)}ms.`);
    }

}