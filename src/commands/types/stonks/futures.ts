import moment from 'moment';
import env from '../../../../env.json';

import { getFutures } from '../../../lib/repo';
import { FuturesQuote } from '../../../lib/stonk';
import { Command, CommandReturn } from '../../command';
import { EmbedFieldData, Message, Permissions, User } from 'discord.js';
import { bold, emboss, generateEmbed, getChangeString, getEmoteForIndicator } from '../../../lib/util';

export default class FuturesCommand extends Command {

    constructor() {
        super('futures', `Invalid usage: ${emboss('.futures')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, true);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let res: FuturesQuote[] = await getFutures(env.futures);
        let fields: EmbedFieldData[] = res.map(future => {
            return {
                name: `${future.name}`,
                value: `${getEmoteForIndicator(future.change, 0, 0, 0)} ${bold(getChangeString(future.change, '$', 2, true))} (${getChangeString(future.change_pct, '', 2, false)}%)\n` 
                        + `:dollar: ${bold('$' + parseFloat(future.last).toLocaleString())} as of ${moment(future.last_time).format('MMM Do [at] h:mm:ss a')}.\n\n`
                        + `**Fundamentals**\n`
                        + `Prev Close: **$${Number(future.previous_day_closing).toFixed(2)}**\n`
                        + `Year Low: ${future.FundamentalData.yrlodate ? `**$${future.FundamentalData.yrloprice}** (${future.FundamentalData.yrlodate})` : bold('Unavailable')}\n`
                        + `Year High: ${future.FundamentalData.yrhidate ? `**$${future.FundamentalData.yrhiprice}** (${future.FundamentalData.yrhidate})` : bold('Unavailable')}\n`
                        + `~~${'-'.repeat(45)}~~`,
                inline: false
            }
        });

        message.reply(generateEmbed('Pre-Market Futures', 'okay', fields));
        return CommandReturn.EXIT;
    }

}