import moment from 'moment';
import env from '../../env.json';
import MA from 'moving-average';
import df, { Units } from 'parse-duration';
import { MACD, RSI } from 'trading-signals';
import { PriceList, RangeGranularity, StonkQuote } from './stonk';
import { EmbedFieldData, Message, MessageEmbed, Permissions, PermissionFlags, User } from 'discord.js';

export const emboss = (message: any) => `\`\`${message}\`\``;
export const bold = (message: any) => `**${message}**`;
export const italic = (message: any) => `*${message}*`;
export const codeBlock = (lang: string, message: any) => `\`\`\`${lang}\n${message}\`\`\``;
export const asMention = (user: User) => `<@${user.id}>`;
export const getDuration = (input: string) => df(input, 's');
export const getDurationWithUnit = (input: string, unit: Units) => df(input, unit);

export interface PermissionAddons extends PermissionFlags {
    SUPERMAN: number;
}

export const CUSTOM_PERMS: PermissionAddons = Permissions.FLAGS as PermissionAddons;
CUSTOM_PERMS.SUPERMAN = 100000

/**
 * Retrieves the formatted duration string
 * for the given millis duration input.
 * 
 * @param time the time in milliseconds
 */
export const getLatestTimeValue = (time: number) => {
    let sec = Math.trunc(time / 1000) % 60;
    let min = Math.trunc(time / 60000 % 60);
    let hrs = Math.trunc(time / 3600000 % 24);
    let days = Math.trunc(time / 86400000 % 30.4368);
    let mon = Math.trunc(time / 2.6297424E9 % 12.0);
    let yrs = Math.trunc(time / 3.15569088E10);

    let y = yrs + "y";
    let mo = mon + "mo";
    let d = days + "d";
    let h = hrs + "h";
    let m = min + "m";
    let s = sec + "s";

    let result = '';
    if (yrs !== 0) result += y + ', ';
    if (mon !== 0) result += mo + ', ';
    if (days !== 0) result += d + ', ';
    if (hrs !== 0) result += h + ', ';
    if (min !== 0) result += m + ', ';
    if (sec !== 0) result += s + ', ';
    
    result = result.substring(0, Math.max(0, result.length - 2));
    if ((yrs !== 0 || mon !== 0 || days !== 0 || min !== 0 || hrs !== 0) && sec !== 0) {
        result += ', ' + s;
    }

    if (yrs === 0 && mon === 0 && days === 0 && hrs === 0 && min === 0 && sec === 0) {
        result += s;
    }

    return result.trim();
}

/**
 * Retrieves all components of the duration
 * for the provided time input.
 * 
 * @param time the time in milliseconds
 */
export const getTimeComponents = (time: number) => {
    let sec = Math.trunc(time / 1000) % 60;
    let min = Math.trunc(time / 60000 % 60);
    let hrs = Math.trunc(time / 3600000 % 24);
    let days = Math.trunc(time / 86400000 % 30.4368);
    let mon = Math.trunc(time / 2.6297424E9 % 12.0);
    let yrs = Math.trunc(time / 3.15569088E10);

    return {
        seconds: sec,
        minutes: min,
        hours: hrs,
        days,
        months: mon,
        years: yrs
    }
}

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

export const getEmoteForIndicator = (indicator: number | string) => {
    if (indicator === 0) return ':arrow_right:';
    if (indicator > 0) return ':arrow_upper_right:';
    if (indicator < 0) return ':arrow_lower_left:';

    return ':twisted_rightwards_arrows:';
}

export const getEmoteForEPS = (eps: number | string) => {
    if (eps === 0) return ':arrow_right:';
    if (eps > 0) return ':arrow_up:';
    if (eps < 0) return ':arrow_down:';

    return ':twisted_rightwards_arrows:';
}

export const getEmoteForStatus = (state: string) => {
    switch (state) {
        case 'PRE':
        case 'POST':
            return '<:idle:493263553101430795>';
        case 'OPEN':
            return '<:online:313956277808005120>';
        case 'CLOSED':
            return '<:dnd:493263553260945419>';
        default:
            return '<:offline:493263553378385931>';
    }
}

export const getEmoteForPermissions = (superPerms: boolean, admin: boolean) => {
    if (superPerms) {
        return ':tools:';
    }

    if (admin) {
        return ':sauropod:';
    }

    return ':runner:';
}

export const timeDiff = (start: number) => (Date.now() - start).toFixed(2);
export const numberEnding = (num: number) => num === 1 ? '' : 's';
export const toggleReactions = () => {
    env.react = !env.react;
    return env.react;
}

export const toggleAlerts = () => {
    env.alerts = !env.alerts;
    return env.alerts;
}

export const containsReactPhrase = (msg: Message) => env.reactPhrases.some(phrase => msg.content.toLowerCase().includes(phrase));

export const validRanges = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'];
export const validIntervals = ['1m', '5m', '10m', '15m', '30m', '1h', '2h', '4h', 'D', 'W', 'M', 'Q', 'Y'];

export const getJoinedList = (list: any[], delimiter: string) => {
    let str = '';
    list.forEach((range, i) => {
        str += range + (i === list.length - 1 ? '' : delimiter);
    });

    return str;
}

export const getMovingAverage = (range: RangeGranularity, prices: PriceList[]) => {
    let duration = getDurationWithUnit(range, 'millisecond');
    let ma = MA(duration);
    prices.forEach(ent => ma.push(ent.x, ent.y));

    return {
        movingAverage: ma.movingAverage(),
        movingVariance: ma.variance(),
        movingDeviation: ma.deviation(),
        forecast: ma.forecast()
    };
}

export const generateSimpleEmbed = (title: string, message: string) => {
    return new MessageEmbed()
        .setTitle(title)
        .setColor(0x27AE60)
        .setDescription(message);
}

export const generateEmbed = (title: string, message: string, fields: EmbedFieldData[]) => {
    return new MessageEmbed()
        .setTitle(title)
        .setColor(0x27AE60)
        .setDescription(message)
        .addFields(fields);
}

export const formatOptionsExpDate = (expDate: Date) => {
    let date = new Date();

    console.log(date.getTime(), expDate.getTime());
    console.log(date.getTime() - expDate.getTime());

    if (date.getFullYear() !== expDate.getFullYear()) {
        return moment(expDate.getTime()).format('M/D/YYYY');
    }

    return moment(expDate.getTime()).format('M/D');
}

export const getExpDate = (input: string): Date => {
    // checks if its MM/DD without year
    if (/^\d{1,2}\/\d{1,2}$/.test(input)) {
        input += '/' + moment(Date.now()).format('YYYY');
    }

    let customDate: any = moment(new Date(input), false);
    if (customDate._d === 'Invalid Date') {
        return null;
    }

    return customDate._d;
}

export const getClosestDate = (input: Date, valid: Date[]) => {
    return valid.reduce((prev, cur) => (Math.abs(cur.getTime() - input.getTime()) < Math.abs(prev.getTime() - input.getTime())) ? cur : prev);
}

export const conforms = (regex: RegExp, target: string) => regex.test(target);