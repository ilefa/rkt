import axios from 'axios';
import MA from 'moving-average';

import { Permissions } from 'discord.js';
import { MACD, RSI } from 'trading-signals';
import { EnrollmentPayload } from '@ilefa/husky';
import { PriceList, RangeGranularity, StonkQuote } from '../stonk';
import { CustomPermissions, getArrowEmoteForData, toDuration } from '@ilefa/ivy';

export enum EmbedIconType {
    AUDIO = 'https://storage.googleapis.com/stonks-cdn/audio.png',
    BIRTHDAY = 'https://storage.googleapis.com/stonks-cdn/birthday.png',
    ERROR = 'https://storage.googleapis.com/stonks-cdn/error.png',
    HELP = 'https://storage.googleapis.com/stonks-cdn/help.png',
    MEMBER = 'https://storage.googleapis.com/stonks-cdn/member.png',
    MESSAGE = 'https://storage.googleapis.com/stonks-cdn/message.png',
    NUMBERS = 'https://storage.googleapis.com/stonks-cdn/numbers.png',
    POLL = 'https://storage.googleapis.com/stonks-cdn/poll.png',
    PREFS = 'https://storage.googleapis.com/stonks-cdn/prefs.png',
    STONKS = 'https://storage.googleapis.com/stonks-cdn/stonks.png',
    TEST = 'https://storage.googleapis.com/stonks-cdn/test.png',
    UCONN = 'https://storage.googleapis.com/stonks-cdn/univ.png',
    XP = 'https://storage.googleapis.com/stonks-cdn/xp.png'
}

export type YtMetaResponse = {
    provider_name?: string;
    provider_url?: string;
    thumbnail_url: string;
    thumbnail_width?: number;
    thumbnail_height?: number;
    author_name: string;
    author_url: string;
    version?: string;
    title: string;
    type?: string;
    html?: string;
    width?: number;
    height?: number;
}

export const RMP_TAG_PROS = [
    'gives good feedback',
    'respected',
    'accessible outside class',
    'inspirational',
    'clear grading criteria',
    'hilarious',
    'amazing lectures',
    'caring',
    'extra credit',
    'would take again',
    'tests? not many'
]

export const RMP_TAG_CONS = [
    'lots of homework',
    'get ready to read',
    'participation matters',
    'skip class? you won\'t pass.',
    'graded by few things',
    'test heavy',
    'beware of pop quizzes',
    'lecture heavy',
    'so many papers',
    'tough grader'
]

export const INVALID_YT_RESPONSE = {
    title: 'Unavailable',
    author_name: 'Unknown',
    author_url: '#',
    thumbnail_url: 'https://i.ytimg.com/vi/1Gj1NvMJBOM/maxresdefault.jpg'
}

export const DAY_MILLIS = 86400000;
export const COMPARISON_COLORS = [
    "rgba(231, 76, 60, 1.0)",
    "rgba(243, 156, 18, 1.0)",
    "rgba(241, 196, 15, 1.0)",
    "rgba(46, 204, 113, 1.0)",
    "rgba(22, 160, 133, 1.0)",
    "rgba(52, 152, 219, 1.0)",
    "rgba(41, 128, 185, 1.0)",
    "rgba(155, 89, 182, 1.0)",
    "rgba(142, 68, 173, 1.0)",
    "rgba(149, 165, 166, 1.0)"
];

export const RESPONSE_GROUP_EMOJI = [
    ":regional_indicator_a:",
    ":regional_indicator_b:",
    ":regional_indicator_c:",
    ":regional_indicator_d:",
    ":regional_indicator_e:",
    ":regional_indicator_f:",
    ":regional_indicator_g:",
    ":regional_indicator_h:",
    ":regional_indicator_i:",
    ":regional_indicator_j:",
    ":regional_indicator_k:",
    ":regional_indicator_l:",
    ":regional_indicator_m:",
    ":regional_indicator_n:",
    ":regional_indicator_o:",
    ":regional_indicator_p:",
    ":regional_indicator_q:",
    ":regional_indicator_r:",
    ":regional_indicator_s:",
    ":regional_indicator_t:",
];

export const RESPONSE_GROUP_EMOJI_RAW = [
    '🇦', '🇧', '🇨',
    '🇩', '🇪', '🇫',
    '🇬', '🇭', '🇮',
    '🇯', '🇰', '🇱',
    '🇲', '🇳', '🇴',
    '🇵', '🇶', '🇷',
    '🇸', '🇹'
];

export const COMPARISON_LEGEND = [
    ":red_circle:",
    ":orange_circle:",
    ":yellow_circle:",
    ":green_circle:",
    ":blue_circle:",
    ":purple_circle:"
];

export const validRanges = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'];
export const validIntervals = ['1m', '5m', '10m', '15m', '30m', '1h', '2h', '4h', 'D', 'W', 'M', 'Q', 'Y'];

/**
 * Attempts to retrieve metadata about
 * a particular youtube video, given
 * it's url.
 * 
 * @param url the youtube url
 */
export const getYtMeta = async (url: string) => axios
    .get(`https://www.youtube.com/oembed?url=${url}&format=json`)
    .then(res => res.data)
    .then(data => data as YtMetaResponse)
    .catch(() => INVALID_YT_RESPONSE);

/**
 * Retrieves the ranged-price variance
 * for a given stock result.
 * 
 * @param res the stock quote result
 */
export const getPriceVariance = (res: StonkQuote) => {
    let payload = res.indicators.quote[0].close;
    return {
        lowest: Math.min(...payload),
        highest: Math.max(...payload)
    };
}

/**
 * Retrieves the total volume traded
 * in the ranged-stock quote result.
 * 
 * @param res the stock quote result
 */
export const getTotalVolume = (res: StonkQuote) => {
    let payload = res.indicators.quote[0].volume;
    return payload.reduce((a, b) => a + b, 0);
}

/**
 * Computes the MACD indicator value for the
 * given ranged-stock quote result.
 * 
 * @param res the stock quote result
 */
export const computeMACD = (res: StonkQuote) => {
    let payload = res.indicators.quote[0].close;
    const computation = new MACD({
        longInterval: 12,
        shortInterval: 26,
        signalInterval: 9,
        useDEMA: true
    });

    payload.forEach(price => {
        if (!price) {
            return;
        }

        computation.update(price);
    });

    return computation.getResult().macd.toFixed(2);
}

/**
 * Computes the RSI indicator value for the
 * given ranged-stock quote result.
 * 
 * @param res the stock quote result
 */
export const computeRSI = (res: StonkQuote) => {
    let payload = res.indicators.quote[0].close;
    const computation = new RSI(14);

    payload.forEach(price => {
        if (!price) {
            return;
        }

        computation.update(price);
    });

    return computation.getResult().toFixed(2);
}

/**
 * Generates a change string for stock prices.
 * 
 * @param input the input value
 * @param seperator the seperator to place between the prepended +/- and the value
 * @param digits the amount of digits to fix the resulting value to
 * @param prependPlus whether or not to prepend a plus sign if the change is positive
 */
export const getChangeString = (input: string | number, seperator: string, digits: number, prependPlus?: boolean) => {
    return (Number(input) > 0 
        ? prependPlus 
            ? '+' 
            : '' 
        : '-') 
        + seperator 
        + Math
            .abs(Number(input))
            .toFixed(digits);
}

/**
 * Returns the arrow emote for a given EPS value.
 * @param eps the eps value for a stock
 */
export const getEmoteForEPS = (eps: number | string) => getArrowEmoteForData(eps, 0, 0, 0);

/**
 * Returns an emote for a user's permission level.
 * 
 * @param superPerms whether the user has super permissions
 * @param admin whether the user has administrator permissions
 */
export const getEmoteForPermissions = (superPerms: boolean, admin: boolean) => {
    if (superPerms) return ':tools:';
    if (admin) return ':sauropod:';
    return ':runner:';
}

export const getEmoteForCommandPermission = (permission: number) => {
    if (permission === CustomPermissions.SUPER_PERMS) return ':eight_spoked_asterisk:';
    if (permission === Permissions.FLAGS.ADMINISTRATOR) return ':a:';
    if (permission === Permissions.FLAGS.BAN_MEMBERS) return ':passport_control:';
    return ':regional_indicator_m:';
}

export const getEmoteForEnrollmentState = (state: EnrollmentPayload) => {
    if (state.overfill && state.available !== state.total) return ':no_entry_sign:';
    if (state.overfill) return ':x:';
    if (state.percent > 0.9) return ':octagonal_sign:';
    return ':white_check_mark:';
}

/**
 * Returns an indicator string
 * for a given campus input.
 * 
 * @param campus the campus input
 */
export const getCampusIndicator = (campus: string) => {
    campus = campus.toLowerCase();
    if (campus === 'storrs') return 'S';
    if (campus === 'hartford') return 'H';
    if (campus === 'stamford') return 'Z';
    if (campus === 'waterbury') return 'W';
    if (campus === 'avery point') return 'A';
    if (campus === 'off-campus') return 'O';

    return '?';
}

/**
 * Computes the moving average, moving variance,
 * moving deviation, and general forecast for
 * a given stock price dataset.
 * 
 * @param range the time period for the provided data
 * @param prices the list of prices for the given time period
 */
export const getMovingAverage = (range: RangeGranularity, prices: PriceList[]) => {
    let duration = toDuration(range, 'millisecond');
    let ma = MA(duration);
    prices.forEach(ent => ma.push(ent.x, ent.y));

    return {
        movingAverage: ma.movingAverage(),
        movingVariance: ma.variance(),
        movingDeviation: ma.deviation(),
        forecast: ma.forecast()
    };
}

/**
 * Adds a trailing decimal to a number
 * if it does not have a decimal.
 * 
 * @param int the number
 */
export const addTrailingDecimal = (int: number) => {
    if (!int.toString().includes('.'))
        return int.toString() + '.0';

    return int.toString();
}