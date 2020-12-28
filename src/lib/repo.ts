import axios from 'axios';

import { 
    DataGranularity,
    RangeGranularity,
    OptionsData,
    StonkQuote,
    FuturesQuote
} from './stonk';

/**
 * Attempts to retrieve a comprehensive quote for the given ticker.
 * 
 * @param ticker the ticker to quote
 * @param range the range of the results
 * @param interval the granularity of the results
 */
export const quote = async (ticker: string, range: string | RangeGranularity, interval: string | DataGranularity): Promise<StonkQuote> => await axios
    .get(`https://query2.finance.yahoo.com/v7/finance/chart/${ticker}?range=${range}&interval=${interval}&includeTimestamps=true&corsDomain=finance.yahoo.com`)
    .then(res => res.data.chart.result[0])
    .then(data => {
        return data;
    })
    .catch(console.error);

/**
 * Attempts to retrieve options data for the given ticker.
 * @param ticker the ticker to lookup information for
 */
export const getOptions = async (ticker: string, expDate?: string | number): Promise<OptionsData> => await axios
    .get(`https://query2.finance.yahoo.com/v7/finance/options/${ticker + (expDate ? '?date=' + expDate : '')}`)
    .then(res => res.data.optionChain.result[0])
    .then(data => {
        return data;
    })
    .catch(console.error);

/**
 * Attempts to retrieve options data for the given ticker.
 * @param ticker the ticker to lookup information for
 */
export const getExpirationDates = async (ticker: string): Promise<number[]> => {
    let data = await getOptions(ticker);
    if (!data) {
        return null;
    } 

    return data.expirationDates;
}

/**
 * Attempts to retrieve futures informations for the given tickers.
 * @param tickers the list of tickers to lookup futures information for
 */
export const getFutures = async (tickers: string[]): Promise<FuturesQuote[]> => await axios
    .get(`https://quote.cnbc.com/quote-html-webservice/quote.htm?partnerId=2&requestMethod=quick&exthrs=1&noform=1&fund=1&output=json&symbols=${tickers.join('|')}`)
    .then(res => res.data)
    .then(data => data.QuickQuoteResult.QuickQuote)
    .catch(console.error);