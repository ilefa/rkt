import moment from 'moment';

import { OptionsContract } from '../../../../../stonk';
import { Command, CommandReturn } from '../../command';
import { Message, Permissions, User } from 'discord.js';
import { getExpirationDates, getOptions } from '../../../../../repo';

import {
    bold,
    conforms,
    emboss,
    generateEmbed,
    generateSimpleEmbed,
    getClosestDate,
    getExpDate
} from '../../../../../util';

export default class ContractCommand extends Command {

    constructor() {
        super('contract', `Invalid usage: ${emboss('.contract <ticker> <strike> <expDate>')}`, null, [
            {
                name: 'Args',
                value: `${bold('__ticker__')}: the ticker to retrieve information for\n` 
                     + `${bold('__strike__')}: the $<strike>[C|P] to retrieve the contract for\n`
                     + `${bold('__expDate__')}: the expiration date to retrieve the contract for`,
                inline: false
            }
        ], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 3) {
            return CommandReturn.HELP_MENU;
        }

        let ticker = args[0].toLowerCase();
        let strikeInput = args[1];
        if (!conforms(/(\$)*\d{1,5}\.*\d{1,5}(c|p)/, strikeInput)) {
            message.reply(generateEmbed('.contract | Argument Error', `Invalid strike price: ${emboss(args[1])}.`, [
                {
                    name: 'Valid Strike Price',
                    value: emboss(`$<price><c|p>`),
                    inline: true
                }
            ]));

            return CommandReturn.EXIT;
        }

        if (!strikeInput.endsWith('c') && !strikeInput.endsWith('p')) {
            message.reply(generateEmbed('.contract | Argument Error', `Invalid strike type: ${emboss(args[1].substring(args[1].length - 1))}.`, [
                {
                    name: 'Valid Strike Type',
                    value: emboss(`$<price><c|p>`),
                    inline: true
                }
            ]));

            return CommandReturn.EXIT;
        }

        let type = args[1].endsWith('c') ? 'c' : 'p';
        let typeFull = type === 'c' ? 'Call' : 'Put';
        let strike = args[1].startsWith('$') 
            ? Number(args[1].substring(1, args[1].indexOf(type))) 
            : Number(args[1].substring(0, args[1].indexOf(type)));

        let expDate: Date;
        if (!!args[2]) {
            let date = getExpDate(args[2]);
            if (!date) {
                message.reply(generateEmbed('.contract | Argument Error', `Invalid expiration date: ${emboss(args[2])}.`, [
                    {
                        name: 'Valid Date Specification',
                        value: emboss(`mm/dd (include year if future year)`),
                        inline: true
                    }
                ]));
                
                return CommandReturn.EXIT;
            }
            
            if (date.getTime() < Date.now()) {
                message.reply(generateEmbed('.contract | Argument Error', `Invalid expiration date: ${emboss(args[2])}.`, [
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

        let validExps = await getExpirationDates(ticker);
        if (!validExps) {
            message.reply(generateSimpleEmbed('.contract | Error', `Oops, I couldn't find anything for ${emboss(ticker)}.`));
            return CommandReturn.EXIT;
        }

        expDate = getClosestDate(expDate ? expDate : new Date(), validExps.map(millis => new Date(millis * 1000)));
        let opts = await getOptions(ticker, expDate.getTime() / 1000);
        if (!opts) {
            message.reply(generateSimpleEmbed('.contract | Error', `Oops, I couldn't find anything for ${emboss(ticker)}.`));
            return CommandReturn.EXIT;
        }
        
        let all = opts.options[0];
        let contracts: OptionsContract[] = [];
        if (type.toLowerCase().startsWith('c')) {
            contracts = all.calls;
        } else if (type.toLowerCase().startsWith('p')) {
            contracts = all.puts;
        } else {
            return CommandReturn.EXIT;
        }

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
        
        let contract = contracts.find((contract: OptionsContract) => contract.strike === strike) as OptionsContract;
        if (!contract) {
            message.reply(generateSimpleEmbed('.contract | Error', `Couldn't find any contracts for ${emboss(ticker)} with parameters ${emboss(`$${strike}${type} (${moment(expDate).format('MM/DD')})`)}.`));
            return CommandReturn.EXIT;
        }

        expDate.setHours(expDate.getHours() + 21);
        let needsYear = expDate.getFullYear() !== new Date().getFullYear();
        message.reply(generateEmbed(`${opts.quote.symbol} $${strike} ${typeFull} - ${moment(expDate).format(`MM/DD${needsYear ? '/YYYY' : ''}`)}`, '', [
            {
                name: 'Price',
                value: `$${contract.lastPrice}`,
                inline: true
            },
            {
                name: 'Bid',
                value: `$${contract.bid}`,
                inline: true,
            },
            {
                name: 'Ask',
                value: `$${contract.ask}`,
                inline: true
            },
            {
                name: 'Today\'s Change',
                value: `${contract.change < 0 ? '-' : '+'}$${Math.abs(contract.change).toFixed(2)} (${contract.percentChange.toFixed(2)}%)`,
                inline: true
            },
            {
                name: 'Implied Volatility',
                value: `${(contract.impliedVolatility * 100).toFixed(2)}%`,
                inline: true
            },
            {
                name: 'Open Interest',
                value: contract.openInterest,
                inline: true
            },
            {
                name: 'Total Volume',
                value: contract.volume.toLocaleString(),
                inline: true
            },
            {
                name: 'Expiration Date',
                value: moment(expDate.getTime()).format('MMMM Do YYYY'),
                inline: true
            },
            {
                name: 'Contract Symbol',
                value: contract.contractSymbol.substring(0, contract.contractSymbol.length - 5),
                inline: true
            }
            /*{
                name: 'Status',
                value: cond(contract.strike - opts.quote.regularMarketPrice < 0,
                    cond(contract.strike - opts.quote.regularMarketPrice > 3,
                        'Deep ITM',
                        cond(contract.strike - opts.quote.regularMarketPrice > 0.25 
                            && contract.strike - opts.quote.regularMarketPrice < 1,
                                'ATM',
                                'ITM')),
                    cond(contract.strike - opts.quote.regularMarketPrice > 3,
                        'Deep OTM',
                        'OTM')),
                inline: true
            }*/
        ]));
        
        return CommandReturn.EXIT;
    }

}