import moment from 'moment';
import env from '../../../../../../env.json';

import { getFutures } from '../../../../repo';
import { FuturesQuote } from '../../../../stonk';
import { EmbedIconType, getChangeString } from '../../../../util';
import { EmbedFieldData, Message, Permissions, User } from 'discord.js';
import { bold, Command, CommandReturn, emboss, getArrowEmoteForData } from '@ilefa/ivy';

export class FuturesCommand extends Command {

    constructor() {
        super('futures', `Invalid usage: ${emboss('.futures')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 0) {
            return CommandReturn.HELP_MENU;
        }

        let res: FuturesQuote[] = await getFutures(env.futures);
        let fields: EmbedFieldData[] = res.map(future => {
            return {
                name: `${future.name}`,
                value: `${getArrowEmoteForData(future.change, 0, 0, 0)} ${bold(getChangeString(future.change, '$', 2, true))} (${getChangeString(future.change_pct, '', 2, false)}%)\n` 
                        + `:dollar: ${bold('$' + parseFloat(future.last).toLocaleString())} as of ${moment(future.last_time).format('MMM Do [at] h:mm:ss a')}.\n\n`
                        + `**Historical**\n`
                        + `Prev Close: **$${Number(future.previous_day_closing).toFixed(2)}**\n`
                        + `Year Low: ${future.FundamentalData.yrlodate ? `**$${future.FundamentalData.yrloprice}** (${future.FundamentalData.yrlodate})` : bold('Unavailable')}\n`
                        + `Year High: ${future.FundamentalData.yrhidate ? `**$${future.FundamentalData.yrhiprice}** (${future.FundamentalData.yrhidate})` : bold('Unavailable')}\n`
                        + `~~${'-'.repeat(45)}~~`,
                inline: false
            }
        });

        message.reply(this.manager.engine.embeds.build('Pre-Market Futures', EmbedIconType.STONKS, '', fields, message));
        return CommandReturn.EXIT;
    }

}