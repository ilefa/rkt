import moment from 'moment';
import env from '../../env.json';
import df from 'parse-duration';
import MA from 'moving-average';

import { Units } from 'parse-duration';
import { MACD, RSI } from 'trading-signals';
import {
    PriceList,
    RangeGranularity,
    StonkQuote
} from './stonk';

import {
    Client,
    EmbedFieldData,
    Emoji,
    Message,
    MessageEmbed,
    Permissions,
    PermissionFlags,
    User
} from 'discord.js';
import { XpBoardUser } from './xp';

export const validRanges = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'];
export const validIntervals = ['1m', '5m', '10m', '15m', '30m', '1h', '2h', '4h', 'D', 'W', 'M', 'Q', 'Y'];

export const emboss = (message: any) => `\`\`${message}\`\``;
export const cond = (cond: boolean, t: string, f: string) => cond ? t : f;
export const bold = (message: any) => `**${message}**`;
export const italic = (message: any) => `*${message}*`;
export const numberEnding = (num: number) => num === 1 ? '' : 's';
export const timeDiff = (start: number) => (Date.now() - start).toFixed(2);
export const conforms = (regex: RegExp, target: string) => regex.test(target);
export const codeBlock = (lang: string, message: any) => `\`\`\`${lang}\n${message}\`\`\``;
export const asEmote = (emote: Emoji) => `<${emote.animated ? 'a' : ''}:${emote.name}:${emote.id}>`;
export const asMention = (user: User | string) => `<@${user instanceof User ? user.id : user}>`;
export const resolveEmote = (client: Client, id: string) => client.emojis.cache.get(id);
export const mentionChannel = (id: string) => `<#${id}>`;
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

export const getEmoteForIndicator = (indicator: number | string, upThreshold: number, downThreshold: number, stagnent: number) => {
    if (indicator === stagnent) return ':arrow_right:';
    if (indicator > upThreshold) return ':arrow_upper_right:';
    if (indicator < downThreshold) return ':arrow_lower_left:';

    return ':twisted_rightwards_arrows:';
}

export const getEmoteForEPS = (eps: number | string) => {
    return getEmoteForIndicator(eps, 0, 0, 0);
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

export const getEmoteForXpPlacement = (placement: number) => {
    if (placement == 1) return ':first_place:';
    if (placement == 2) return ':second_place:';
    if (placement == 3) return ':third_place:';

    return `:${toWords(placement)}:`;
}

export const getUpwardXpDifference = (rankings: XpBoardUser[], placement: number) => {
    return rankings[placement - 1].xp - rankings[placement].xp;
}

export const getDownwardXpDifference = (rankings: XpBoardUser[], placement: number) => {
    return rankings[placement].xp - rankings[placement + 1].xp;
}

// https://gist.github.com/ForbesLindesay/5467742
export const toWords = (num: number) => {
    let ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
                'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
                'seventeen', 'eighteen', 'nineteen'];

    let tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty',
                'ninety'];
  
    let numString = num.toString();
    if (num < 0) return null;
    if (num === 0) return 'zero';
  
    //the case of 1 - 20
    if (num < 20) {
        return ones[num];
    }
  
    if (numString.length === 2) {
        return tens[numString[0]] + ' ' + ones[numString[1]];
    }
  
    //100 and more
    if (numString.length == 3) {
      if (numString[1] === '0' && numString[2] === '0')
        return ones[numString[0]] + ' hundred';
      else
        return ones[numString[0]] + ' hundred and ' + toWords(+(numString[1] + numString[2]));
    }
  
    if (numString.length === 4) {
      var end = +(numString[1] + numString[2] + numString[3]);
      if (end === 0) return ones[numString[0]] + ' thousand';
      if (end < 100) return ones[numString[0]] + ' thousand and ' + toWords(end);
      return ones[numString[0]] + ' thousand ' + toWords(end);
    }
}

export const ordinalSuffix = (i: number) => {
    let j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

export const toggleReactions = () => {
    env.react = !env.react;
    return env.react;
}

export const toggleAlerts = () => {
    env.alerts = !env.alerts;
    return env.alerts;
}

export const getReactionPhrase = (msg: Message) => {
    let formatted = msg.content.toLowerCase();
    let payload = env.reactPhrases.filter(ent => ent.phrases.includes(formatted))[0];
    if (!payload) {
        return null;
    }

    return {
        message: payload.phrases[formatted] as string,
        response: payload.emote
    };
}

/**
 * Creates a joined string from a list of objects.
 * 
 * @param list the list of objects
 * @param delimiter the delimiter
 */
export const getJoinedList = (list: any[], delimiter: string) => {
    let str = '';
    list.forEach((range, i) => {
        str += range + (i === list.length - 1 ? '' : delimiter);
    });

    return str;
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

/**
 * Shorthand for generating a simple message embed.
 * 
 * @param title the title of the embed
 * @param message the description for the embed
 */
export const generateSimpleEmbed = (title: string, message: string) => {
    return new MessageEmbed()
        .setTitle(title)
        .setColor(0x27AE60)
        .setDescription(message);
}

/**
 * Shorthand for generating a simple message embed.
 * 
 * @param title the title of the embed
 * @param message the description for the embed
 * @param image the thumbnail for the embed
 */
export const generateSimpleEmbedWithImage = (title: string, message: string, image: string) => {
    return generateSimpleEmbed(title, message)
        .setThumbnail(image);
}

/**
 * Shorthand for generating a complex message embed.
 * 
 * @param title the title of the embed
 * @param message the description for the embed
 * @param fields a list of EmbedFieldData for the embed
 */
export const generateEmbed = (title: string, message: string, fields: EmbedFieldData[]) => {
    return generateSimpleEmbed(title, message)
        .addFields(fields);
}

/**
 * Extracts a valid expiration date out of a
 * user-provided expiration date for a contract.
 * 
 * @param input the inputted contract expiry date
 */
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

/**
 * Attempts to retrieve the closest date
 * to the inputted value from a given list.
 * 
 * @param input the inputted date
 * @param valid a list of valid dates
 */
export const getClosestDate = (input: Date, valid: Date[]) => {
    return valid.reduce((prev, cur) => (Math.abs(cur.getTime() - input.getTime()) < Math.abs(prev.getTime() - input.getTime())) ? cur : prev);
}