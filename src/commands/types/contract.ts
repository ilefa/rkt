import moment from 'moment';

import { Message, Permissions, User } from 'discord.js';
import { Command, CommandReturn } from '../command';
import { OptionsContract } from '../../lib/stonk';
import { getOptions } from '../../lib/repo';

import {
    codeBlock,
    conforms,
    emboss,
    generateEmbed,
    generateSimpleEmbed,
    getClosestDate,
    getExpDate
} from '../../lib/util';

export default class ContractCommand extends Command {

    constructor() {
        super('contract', `Invalid usage: ${emboss('.contract <ticker> <strike:C|P> <expDate>')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        message.delete();

        if (args.length !== 3) {
            return CommandReturn.HELP_MENU;
        }

        let ticker = args[0];
        let strikeInput = args[1];
        if (!conforms(/(\$)*\d{1,5}\.*\d{1,5}(c|p)/, strikeInput)) {
            message.reply(generateEmbed('.contract | Argument Error', `Invalid strike price: ${emboss(args[1])}.`, [
                {
                    name: 'Valid Strike Price',
                    value: emboss(`$<price><c|p>`),
                    inline: true
                }
            ]));
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

        let opts = await getOptions(ticker, expDate.getTime());
        if (!opts) {
            message.reply(generateSimpleEmbed('.contracts | Error', `Oops, I couldn't find anything for ${emboss(ticker)}.`));
            return CommandReturn.EXIT;
        }

        if (expDate) expDate = getClosestDate(expDate, opts.expirationDates.map(millis => new Date(millis)));
        if (!expDate) expDate = new Date();

        let all = opts.options[0];
        let contracts = [];
        if (type === 'c') {
            contracts = all.calls;
        } else if (type === 'p') {
            contracts = all.puts;
        }

        let contract = contracts.find((contract: OptionsContract) => contract.strike === strike);

        if (!contract) {
            message.reply(generateSimpleEmbed('.contracts | Error', `Couldn't find any contracts for ${emboss(ticker)} with ${emboss(`$${strike}${type} (${moment(expDate).format('MM/DD')})`)}.`));
            return CommandReturn.EXIT;
        }

        let components = {
            strike: {
                price: strike,
                type: typeFull
            },
            expDate,
            contract
        }

        message.reply(codeBlock('json', JSON.stringify(components, null, 3)));
        return CommandReturn.EXIT;
    }

}