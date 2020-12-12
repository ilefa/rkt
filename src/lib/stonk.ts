export type StonkQuote = {
    meta: {
        symbol: string;
        exchangeName: string;
        instrumentType: string;
        currency: string;
        firstTradeDate: number | Date;
        regularMarketTime: number | Date;
        gmtoffset: number;
        timezone: string;
        exchangeTimezoneName: string;
        regularMarketPrice: number;
        chartPreviousClose: number;
        previousClose: number;
        scale: number;
        priceHint: number;
        currentTradingPeriod: {
            pre: TradingPeriod;
            regular: TradingPeriod;
            post: TradingPeriod;
        },
        tradingPeriods: [TradingPeriod[]];
        dataGranularity: RangeGranularity;
        range: RangeGranularity;
        validRanges: RangeGranularity;
    },
    timestamp: number[]; 
    indicators: {
        quote: [
            {
                open: number[];
                close: number[];
                low: number[];
                high: number[];
                volume: number[];
            }
        ]
    }
}

export type TradingPeriod = {
    timezone: string;
    start: number | Date;
    end: number | Date;
    gmtoffset: number;
}

export type PriceList = {
    x: Date;
    y: number;
}

export type DataGranularity = '1m' | '5m' | '10m' | '15m' | '30m' | '1h' | '2h' | '4h' | 'D' | 'W' | 'M' | 'Q' | 'Y'
export type RangeGranularity = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max'

export type OptionsData = {
    quote: OptionsStonkQuote;
    strikes: number[];
    expirationDates: number[];
    options: [{
        expirationDate: number;
        hasMiniOptions: boolean;
        calls: OptionsContract[];
        puts: OptionsContract[];
    }];
    underlyingSymbol: string;
}

export type OptionsContract = {
    contractSymbol: string;
    strike: number;
    currency: string;
    lastPrice: number;
    change: number;
    percentChange: number;
    openInterest: number;
    bid: number;
    ask: number;
    contractSize: string;
    expiration: number | Date;
    lastTradeDate: number | Date;
    impliedVolatility: number;
    inTheMoney: boolean;
}

export type OptionsStonkQuote = {
    language: string;
    region: string;
    quoteType: OptionsStonkQuoteType;
    quoteSourceName: string;
    triggerable: boolean;
    currency: string;
    tradeable: boolean;
    postMarketChangePercent: number;
    postMarketTime: number;
    postMarketPrice: number;
    regularMarketOpen: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketTime: number;
    regularMarketPrice: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketDayRange: string;
    regularMarketDayVolume: number;
    regularMarketPreviousClose: number;
    bid: number;
    ask: number;
    bidSize: number;
    askSize: number;
    marketCap: number;
    fullExchangeName: string;
    financialCurrency: string;
    averageDailyVolume3Month: number;
    averageDailyVolume10Day: number;
    fiftyTwoWeekLow: number;
    fiftyTwoWeekLowChange: number;
    fiftyTwoWeekLowChangePercent: number;
    fiftyTwoWeekRange: string;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekHighChange: number;
    fiftyTwoWeekHighChangePercent: number;
    earningsTimestamp: number;
    earningsTimestampStart: number;
    earningsTimestampEnd: number;
    forwardPE: number;
    trailingPE: number;
    epsTrailingTwelveMonths: number;
    epsForward: number;
    epsCurrentYear: number;
    priceEpsCurrentYear: number;
    sharesOutstanding: number;
    bookValue: number;
    priceToBook: number;
    fiftyDayAverage: number;
    fiftyDayAverageChange: number;
    fiftyDayAverageChangePercent: number;
    twoHundredDayAverage: number;
    twoHundredDayAverageChange: number;
    twoHundredDayAverageChangePercent: number;
    sourceInterval: number;
    exchangeDataDelayedBy: number;
    firstTradeDateMilliseconds: number;
    priceHint: number;
    marketState: string;
    exchange: string;
    shortName: string;
    longName: string;
    exchangeTimezoneName: string;
    exchangeTimezoneShortName: string;
    gmtOffSetMilliseconds: number;
    market: string;
    displayName: string;
    symbol: string;
}

export type OptionsStonkQuoteType = 'EQUITY';