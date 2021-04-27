import { EmbedIconType } from '../../../../util';
import { Message, Permissions, User } from 'discord.js';
import { getServiceStatus, UConnServiceStatus } from '@ilefa/husky';

import {
    bold,
    Command,
    CommandReturn,
    cond,
    count,
    emboss,
    link,
    numberEnding,
    RED_CIRCLE,
    GREEN_CIRCLE,
    YELLOW_CIRCLE
} from '@ilefa/ivy';

const OPERATIONAL = GREEN_CIRCLE;
const REPORTING = '<:blue:836447279782297640>';
const DEGRADED = YELLOW_CIRCLE;
const OUTAGE = RED_CIRCLE;

export class UConnStatusCommand extends Command {
    
    constructor() {
        super('ucs', `Invalid usage: ${emboss('.ucs')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }
    
    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length > 0) {
            return CommandReturn.HELP_MENU;
        }

        let statuses = await getServiceStatus();
        let tagline = 'There are no ongoing outages as of right now.';
        let outages = count(statuses, srv => srv.status !== UConnServiceStatus.OPERATIONAL);
        if (outages > 0) tagline = `There ${cond(outages == 1, 'is', 'are')} ${bold(outages)} ongoing outage${numberEnding(outages)} as of now.`;

        message.reply(this.embeds.build('UConn Service Status', EmbedIconType.UCONN, tagline + `\nClick the following link to visit the ${link('IT Status Webpage', 'https://itstatus.uconn.edu')}.`,
            statuses.map(srv => {
                return {
                    name: srv.service,
                    value: `${this.emoteForStatus(srv.status)} ${srv.status}`,
                    inline: true
                }
            }), message));

        return CommandReturn.EXIT;
    }

    emoteForStatus = (status: UConnServiceStatus) => {
        switch (status) {
            case UConnServiceStatus.OPERATIONAL: return OPERATIONAL;
            case UConnServiceStatus.REPORTING: return REPORTING;
            case UConnServiceStatus.DEGRADED: return DEGRADED;
            case UConnServiceStatus.OUTAGE: return OUTAGE;
        }
    }
    
}