import { genPriceChart } from '../../../../../chart';
import { getOptions, quote } from '../../../../../repo';
import { User, Message, Permissions } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../../command';
import { DataGranularity, PriceList, RangeGranularity } from '../../../../../stonk';

import {
    bold,
    emboss,
    computeMACD,
    computeRSI,
    generateSimpleEmbed,
    getEmoteForEPS,
    getEmoteForIndicator,
    getJoinedList,
    getTotalVolume,
    validRanges,
    validIntervals,
    EmbedIconType,
    generateEmbedWithFieldsAndImage,
    startLoader,
    MessageLoader,
    endLoader,
} from '../../../../../util';

export default class QuoteCommand extends Command {
    
    constructor() {
        super('quote', CommandCategory.STONKS, `Invalid usage: ${emboss('.quote <ticker> <[range] [interval]>')}`, null, [
            {
                name: 'Args',
                value: `${bold('__ticker__')}: the ticker to retrieve data for\n` 
                     + `${bold('__range__')}: the time period for the results\n` 
                     + `${bold('__interval__')}: the granularity of those results`,
                inline: true
            },
            {
                name: 'Valid Ranges',
                value: `${emboss(getJoinedList(validRanges, ', '))}`,
                inline: false
            },
            {
                name: 'Valid Intervals',
                value: `${emboss(getJoinedList(validIntervals, ', '))}`,
                inline: false
            }
        ], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0 || args.length > 3) {
            return CommandReturn.HELP_MENU;
        }
        
        let ticker = args[0].toUpperCase();
        let range: RangeGranularity = args.length > 1 ? args[1] as any : '5d';
        let interval: DataGranularity = args.length > 2 ? args[2] as any : '5m';
        let loader: MessageLoader = await startLoader(message);

        let res = await quote(ticker, range, interval);
        if (!res) {
            message.reply(generateSimpleEmbed('.quote | Error', EmbedIconType.STONKS, `Couldn't find any results for ticker ${emboss(ticker)}.`));
            endLoader(loader);
            return CommandReturn.EXIT;
        }

        let opt = await getOptions(ticker);
        let payload = res.indicators.quote[0].close;
        if (!payload) {
            message.reply(generateSimpleEmbed('.quote | Error', EmbedIconType.STONKS, `An unknown error occurred while quoting ${emboss(ticker)}.`));
            endLoader(loader);
            return CommandReturn.EXIT;
        }

        let prices: PriceList[] = [];
        payload.forEach((price, i) => {
            if (!price) {
                return;
            }

            let date = new Date(res.timestamp[i] * 1000);
            date.setHours(date.getHours() - 5);

            prices.push({
                x: date,
                y: Number(price.toFixed(3))
            });
        });

        let vol = res.indicators.quote[0].volume;
        let volumes: PriceList[] = [];
        vol.forEach((volume, i) => {
            if (!volume) {
                return;
            }

            let date = new Date(res.timestamp[i] * 1000);
            date.setHours(date.getHours() - 5);

            volumes.push({
                x: date,
                y: Number(volume.toFixed(2))
            })
        });

        let chart = await genPriceChart(prices, prices[0].y)
            .setWidth(1250)
            .setHeight(800)
            .setBackgroundColor('rgba(0, 0, 0, 0)')
            .getShortUrl();

        let volume = getTotalVolume(res);
        let macd = computeMACD(res);
        let rsi = computeRSI(res);
        
        let state = opt.quote.marketState;
        state = state.substring(state.indexOf(state));
        
        endLoader(loader);

        message.reply(generateEmbedWithFieldsAndImage(`${opt.quote.displayName ? opt.quote.displayName : ticker}`, EmbedIconType.STONKS,
            `Retrieved quote data for ${bold(ticker)} for the last ${emboss(`${range} (${interval})`)}.`,
            [
                {
                    name: 'Price',
                    value: `$${res.meta.regularMarketPrice}`,
                    inline: true
                },
                {
                    name: 'Bid',
                    value: `$${opt.quote.bid}/${opt.quote.bidSize}`,
                    inline: true,
                },
                {
                    name: 'Ask',
                    value: `$${opt.quote.ask}/${opt.quote.askSize}`,
                    inline: true,
                },
                {
                    name: 'Today\'s Range',
                    value: `$${opt.quote.regularMarketDayLow}-$${opt.quote.regularMarketDayHigh}`,
                    inline: true
                },
                {
                    name: '52 Week Range',
                    value: `$${opt.quote.fiftyTwoWeekLow.toFixed(2)}-$${opt.quote.fiftyTwoWeekHigh.toFixed(2)}`,
                    inline: true,
                },
                {
                    name: 'Volume',
                    value: volume.toLocaleString(),
                    inline: true
                },
                {
                    name: 'EPS (Year)',
                    value: `${getEmoteForEPS(opt?.quote?.epsTrailingTwelveMonths?.toFixed(2))} ${opt.quote.epsTrailingTwelveMonths ? opt.quote.epsTrailingTwelveMonths.toFixed(2) : 'Unknown'}`,
                    inline: true,
                },
                {
                    name: 'MACD',
                    value: `${getEmoteForIndicator(macd, 0, 0, 0) + ' ' + macd}`,
                    inline: true,
                },
                {
                    name: 'RSI',
                    value: `${getEmoteForIndicator(rsi, 40, 40, 40) + ' ' + rsi}`,
                    inline: true
                }
            ], chart));
            
        return CommandReturn.EXIT;
    }

}