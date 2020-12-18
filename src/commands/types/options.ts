import moment from 'moment';

import { Command, CommandReturn } from '../command';
import { OptionsContract } from '../../lib/stonk';
import { getOptions } from '../../lib/repo';

import {
    EmbedFieldData,
    Message,
    MessageEmbed,
    Permissions,
    User
} from 'discord.js';

import {
    bold,
    emboss,
    generateEmbed,
    generateSimpleEmbed,
    getClosestDate,
    getExpDate,
    numberEnding
} from '../../lib/util';

export default class OptionsCommand extends Command {

    constructor() {
        super('options', `Invalid usage: ${emboss('.options <ticker> <c|p> [<expDate>]')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 2 && args.length !== 3) {
            return CommandReturn.HELP_MENU;
        }

        let ticker = args[0];
        let contractType = args[1].toLowerCase();
        if (contractType !== 'c'
                && contractType !== 'call' 
                && contractType !== 'p' 
                && contractType !== 'put') {
            message.reply(generateEmbed('.options | Argument Error', `Invalid contract type: ${emboss(contractType)}.`, [
                {
                    name: 'Valid Contract Types',
                    value: emboss('c[all], p[ut]'),
                    inline: true
                }
            ]));
            return CommandReturn.EXIT;
        }

        let expDate: Date;
        if (!!args[2]) {
            let date = getExpDate(args[2]);
            if (!date) {
                message.reply(generateEmbed('.options | Argument Error', `Invalid expiration date: ${emboss(args[2])}.`, [
                    {
                        name: 'Valid Date Specification',
                        value: emboss(`mm/dd (include year if future year)`),
                        inline: true
                    }
                ]));
                
                return CommandReturn.EXIT;
            }
            
            if (date.getTime() < Date.now()) {
                message.reply(generateEmbed('.options | Argument Error', `Invalid expiration date: ${emboss(args[2])}.`, [
                    {
                        name: 'Reason',
                        value: 'You cannot query historical options data.',
                        inline: true
                    }
                ]));

                return CommandReturn.EXIT;
            }

            expDate = date;
        }

        let opts = await getOptions(ticker, expDate.getTime());
        if (!opts) {
            message.reply(generateSimpleEmbed('.options | Error', `Oops, I couldn't find anything for ${emboss(ticker)}.`));
            return CommandReturn.EXIT;
        }

        if (expDate) expDate = getClosestDate(expDate, opts.expirationDates.map(millis => new Date(millis * 1000)));
        if (!expDate) expDate = new Date();

        let all = opts.options[0];
        let contracts = [];
        if (contractType === 'c' || contractType === 'call') {
            contracts = all.calls;
            contractType = 'Call';
        } else if (contractType === 'p' || contractType === 'put') {
            contracts = all.puts;
            contractType = 'Put';
        }

        let str = '';
        let matches: EmbedFieldData[] = [];
        contracts = contracts.sort((a: OptionsContract, b: OptionsContract) => {
            return Math.abs(a.strike - opts.quote.regularMarketPrice) - Math.abs(b.strike - opts.quote.regularMarketPrice);
        });

        contracts = contracts.slice(0, 20);
        contracts = contracts.sort((a: OptionsContract, b: OptionsContract) => {
            // this shouldn't happen
            if (a.strike === b.strike) {
                return 0;
            }

            if (a.strike < b.strike) {
                return -1;
            }

            return 1;
        })

        contracts.forEach((contract: OptionsContract) => {
            matches.push({
                name: `$${contract.strike} ${contractType}`,
                value: `$${(contract.lastPrice).toFixed(2)} ${contract.inTheMoney ? '(ITM)' : '(OTM)'} [IV: ${(contract.impliedVolatility * 100).toFixed(2)}%]\nOP: ${contract.openInterest}, B/A: ${contract.bid}/${contract.ask}, C%: ${(contract.percentChange).toFixed(2)}%`,
                inline: true
            });

            str += `${bold(`$${contract.strike} ${contractType}`)} for $${contract.lastPrice}\n`;
        });

        str = str.trim();

        let expire = new Date(expDate.getTime());
        expire.setHours(expire.getHours() + 21); // UTC-fuckery

        let embed = new MessageEmbed()
            .setTitle(`${opts.quote.displayName} Options (${moment(expire).format('MM/DD')})`)
            .setColor(0x27AE60)
            .setDescription(`Listing ${contracts.length} contract${numberEnding(contracts.length)} expiring ${bold(moment(expire).fromNow())}.`)
            .addFields(matches);

        message.reply(embed);
        return CommandReturn.EXIT;
    }

}