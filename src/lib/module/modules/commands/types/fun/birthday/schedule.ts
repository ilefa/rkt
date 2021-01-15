import moment from 'moment';
import ensure from 'cron-validate';
import BirthdayManager from '../../../../birthday';
import CommandComponent from '../../../components/component';

import { CommandReturn } from '../../../command';
import { parseCronExpression } from 'cron-schedule';
import { Message, Permissions, User } from 'discord.js';
import {
    bold,
    codeBlock,
    EmbedIconType,
    emboss,
    generateEmbed,
    generateSimpleEmbed
} from '../../../../../../util';

export default class SetBirthdayScheduleCommand extends CommandComponent<BirthdayManager> {

    constructor() {
        super('schedule', 'schedule [cron:expr]', Permissions.FLAGS.ADMINISTRATOR);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            let schedule = await this.manager.getSchedule(message.guild);
            if (!schedule) {
                message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `Alerts schedule for ${bold(message.guild.name)} has not been configured yet.\n` 
                    + `Please configure it using ${emboss('.birthday schedule [cron:expr]')}.`));
                return CommandReturn.EXIT;
            }

            let cron = parseCronExpression(schedule);
            if (!cron) {
                message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `The configured cron schedule for ${bold(message.guild.name)} is not valid.\n` 
                    + `Please configure it using ${emboss('.birthday schedule [cron:expr]')}.`));
                return CommandReturn.EXIT;
            }

            let next = cron.getNextDate();
            message.reply(generateEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `Schedule settings for ${bold(message.guild.name)}:`, [
                {
                    name: 'Status',
                    value: 'Enabled',
                    inline: true
                },
                {
                    name: 'Cron Schedule',
                    value: emboss(schedule),
                    inline: true
                },
                {
                    name: 'Next Execution',
                    value: emboss(moment(next).format('MMMM Do YYYY, h:mm:ss a')),
                    inline: false
                }
            ]));

            return CommandReturn.EXIT;
        }

        let schedule = args.join(' ');
        let spec = `*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)`;

        let check = ensure(schedule);
        if (!check.isValid()) {
            message.reply(generateEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `Invalid cron schedule: ${emboss(schedule)}`, [
                {
                    name: 'Error Details',
                    value: check.getError() && check.getError()
                        ? check
                            .getError()
                            .map(message => message.split('. (Input cron:')[0])
                            .map(message => ' • ' + emboss(message))
                            .join('\n')
                            .trim() 
                        : 'This schedule is invalid',
                    inline: false
                },
                {
                    name: 'Valid Cron Specification',
                    value: `
                    ${codeBlock('', spec)}

                    ${bold('Additional Specifiers')}
                    ${emboss('*')}  any value
                    ${emboss('a,b')} value list separator
                    ${emboss('a-b')} range of values
                    ${emboss('a/b')} step values
                    `,
                    inline: false
                }
            ]));
            return CommandReturn.EXIT;
        }

        this.manager.setSchedule(message.guild, schedule);
        message.reply(generateSimpleEmbed('Birthday Management', EmbedIconType.BIRTHDAY, `Alerts schedule for ${bold(message.guild.name)} set to ${emboss(schedule)}.`));
        return CommandReturn.EXIT;
    }
    
}