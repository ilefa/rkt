import axios from 'axios';
import { DataGranularity, RangeGranularity, OptionsData, StonkQuote } from './stonk';

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
    .catch(err => console.error(err));

/**
 * Attempts to retrieve options data for the given ticker.
 * @param ticker the ticker to lookup information for
 */
export const getOptions = async (ticker: string, expDate?: string | number): Promise<OptionsData> => await axios
    .get(`https://query2.finance.yahoo.com/v7/finance/options/${ticker + (expDate ? '?expirationDate=' + expDate : '')}`)
    .then(res => res.data.optionChain.result[0])
    .then(data => {
        return data;
    })
    .catch(err => console.error(err));