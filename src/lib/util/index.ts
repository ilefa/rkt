import axios from 'axios';
import moment from 'moment';
import df from 'parse-duration';
import MA from 'moving-average';
import env from '../../../env.json';

import { Units } from 'parse-duration';
import { GameEmbedAwaiter } from './game';
import { MACD, RSI } from 'trading-signals';
import { PaginatedEmbed } from './paginator';
import { XpBoardUser } from '../module/modules/xp/struct';

import {
    PriceList,
    RangeGranularity,
    StonkQuote
} from '../stonk';

import {
    Client,
    EmbedFieldData,
    Emoji,
    Guild,
    Message,
    MessageEmbed,
    Permissions,
    PermissionFlags,
    User
} from 'discord.js';

export { PaginatedEmbed, GameEmbedAwaiter };

export const LOADER = '<a:loading:788890776444207194>';
export const JOIN_BUTTON = '<:join:798763992813928469>';

export const SNOWFLAKE_REGEX = /^\d{18,}$/;
export const EMOTE_REGEX = /<(a|):\w+:\d{18,}>/;
export const USER_MENTION_REGEX = /^<@\!\d{18,}>$/;

export const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

export enum EmbedIconType {
    AUDIO = 'https://storage.googleapis.com/stonks-cdn/audio.png',
    BIRTHDAY = 'https://storage.googleapis.com/stonks-cdn/birthday.png',
    COUNTHER = 'https://storage.googleapis.com/stonks-cdn/counther.png',
    ERROR = 'https://storage.googleapis.com/stonks-cdn/error.png',
    HELP = 'https://storage.googleapis.com/stonks-cdn/help.png',
    JACK = 'https://storage.googleapis.com/stonks-cdn/jack.png',
    MESSAGE = 'https://storage.googleapis.com/stonks-cdn/message.png',
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
]

export const COMPARISON_LEGEND = [
    ":red_circle:",
    ":orange_circle:",
    ":yellow_circle:",
    ":green_circle:",
    ":blue_circle:",
    ":purple_circle:"
]

export const validRanges = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'];
export const validIntervals = ['1m', '5m', '10m', '15m', '30m', '1h', '2h', '4h', 'D', 'W', 'M', 'Q', 'Y'];

export const emboss = (message: any) => `\`\`${message}\`\``;
export const cond = (cond: boolean, t: string, f: string) => cond ? t : f;
export const bold = (message: any) => `**${message}**`;
export const italic = (message: any) => `*${message}*`;
export const link = (display: string, link: string) => `[${display}](${link})`;
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
export const capitalizeFirst = (input: string) => input.split(' ').map(str => str.charAt(0).toUpperCase() + str.slice(1)).join('');
export const isFC = (guild: Guild | string) => guild instanceof Guild 
    ? guild.id === '749978305549041734' 
    : guild === '749978305549041734';

/**
 * Returns whether or not a given user has
 * a certain bot permission in a given guild.
 * 
 * Note: This does not necessarily mean that
 * the user has that permission in the guild
 * (in the case of superperms users always being true).
 * 
 * @param user the user in question
 * @param permission the permission in question
 * @param guild the guild in which this takes place
 */
export const has = (user: User, permission: number, guild: Guild) => 
    guild
        .member(user)
        .hasPermission(permission) 
            || env
                .superPerms
                .some(id => user.id === id)

/**
 * Attempts to find a user by a mention, or by
 * their snowflake ID from a given message.
 * 
 * @param message the message related to this query
 * @param input the user input to query for
 * @param def the fallback user in case the input is invalid
 */
export const findUser = async (message: Message, input: string, def: User) => {
    let target: User = def;
    if (input) {
        let client = input;
        let temp = null;
        if (SNOWFLAKE_REGEX.test(client)) {
            temp = await message.client.users.fetch(client);
        }

        if (USER_MENTION_REGEX.test(client)) {
            let id = client.slice(3, client.length - 1);
            temp = await message.client.users.fetch(id);
        }

        target = temp;
    }

    if (!target && def) {
        return def;
    }

    return target;
}

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
 * Blocks all I/O for the
 * specified millisecond duration.
 * 
 * @param ms millis to sleep
 */
export const sleep = async ms => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Replaces all occurances of a given
 * search string within another string.
 * 
 * @param input the input string
 * @param search the string to replace
 * @param replace what to replace it with
 */
export const replaceAll = (input: string, search: string, replace: string) => {
    let copy = String(input);
    if (!copy.includes(search)) {
        return copy;
    }

    while (copy.includes(search)) {
        copy = copy.replace(search, replace);
    }

    return copy;
}

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
    
    result = result.substring(0, Math.max(0, result.length - 2));
    if ((yrs !== 0 || mon !== 0 || days !== 0 || min !== 0 || hrs !== 0) && sec !== 0) {
        result += ', ' + s;
    }

    if (yrs === 0 && mon === 0 && days === 0 && hrs === 0 && min === 0) {
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

/**
 * Returns the indicator emote for a given value.
 * 
 * @param indicator the indicator value
 * @param upThreshold the threshold for an upwards arrow to appear
 * @param downThreshold the threshold for a downwards arrow to appear
 * @param stagnent the threshold for a stagnant arrow to appear
 */
export const getEmoteForIndicator = (indicator: number | string, upThreshold: number, downThreshold: number, stagnent: number) => {
    if (indicator === stagnent) return ':arrow_right:';
    if (indicator > upThreshold) return ':arrow_upper_right:';
    if (indicator < downThreshold) return ':arrow_lower_left:';

    return ':twisted_rightwards_arrows:';
}

/**
 * Returns the arrow emote for a given EPS value.
 * @param eps the eps value for a stock
 */
export const getEmoteForEPS = (eps: number | string) => getEmoteForIndicator(eps, 0, 0, 0);

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
    if (permission === CUSTOM_PERMS.SUPERMAN) return ':eight_spoked_asterisk:';
    if (permission === Permissions.FLAGS.ADMINISTRATOR) return ':a:';
    return ':regional_indicator_m:';
}

/**
 * Returns an emote for the XP placement leaderboard.
 * @param placement the xp placement
 */
export const getEmoteForXpPlacement = (placement: number) => {
    if (placement == 1) return ':first_place:';
    if (placement == 2) return ':second_place:';
    if (placement == 3) return ':third_place:';
    if (placement == 10) return ':keycap_ten:';
    if (placement > 10) return '';

    return `:${toWords(placement)}:`;
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
 * Returns the upwards XP difference
 * for a given placement.
 * 
 * @param rankings a list of xp rankings
 * @param placement the placement to query
 */
export const getUpwardXpDifference = (rankings: XpBoardUser[], placement: number) => {
    return rankings[placement - 1].xp - rankings[placement].xp;
}

/**
 * Returns the downwards XP difference
 * for a given placement.
 * 
 * @param rankings a list of xp rankings
 * @param placement the placement to query
 */
export const getDownwardXpDifference = (rankings: XpBoardUser[], placement: number) => {
    return rankings[placement].xp - rankings[placement + 1].xp;
}

/**
 * Returns a word form of a provided
 * number. Useful for number emotes.
 * 
 * @param num the number to convert
 * @see https://gist.github.com/ForbesLindesay/5467742
 */
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

/**
 * Returns a number and it's appropriate suffix
 * appended to the end of the string.
 * 
 * @param i the number to convert
 */
export const ordinalSuffix = (i: number) => {
    let j = i % 10,
        k = i % 100;

    if (j == 1 && k != 11) return i + "st";
    if (j == 2 && k != 12) return i + "nd";
    if (j == 3 && k != 13) return i + "rd";
    
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
 * Creates a joined string from a list of objects.
 * 
 * @param list a list of elements of type U
 * @param delimiter the delimiter for the joined elements
 * @param apply applies the given function to each element of the list
 */
export const join = <U, T>(list: U[], delimiter: string, apply: (val: U) => T) => {
    let str = '';
    list
        .map(apply)
        .forEach((range, i) => {
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
 * @param icon the embed icon
 * @param message the description for the embed
 */
export const generateSimpleEmbed = (title: string, icon: EmbedIconType | string, message: string) => {
    return new MessageEmbed()
        .setAuthor(title, icon)
        .setColor(0x27AE60)
        .setDescription(message);
}

/**
 * Shorthand for generating a simple message embed.
 * 
 * @param title the title of the embed
 * @param icon the embed icon
 * @param message the description for the embed
 * @param image the thumbnail for the embed
 */
export const generateSimpleEmbedWithThumbnail = (title: string,
                                                 icon: EmbedIconType | string,
                                                 message: string,
                                                 image: string) => {
    return generateSimpleEmbed(title, icon, message)
        .setThumbnail(image);
}

/**
 * Shorthand for generating a simple message embed.
 * 
 * @param title the title of the embed
 * @param icon the embed icon
 * @param message the description for the embed
 * @param image the thumbnail for the embed
 */
export const generateSimpleEmbedWithImage = (title: string,
                                             icon: EmbedIconType | string,
                                             message: string,
                                             image: string) => {
    return generateSimpleEmbed(title, icon, message)
        .setImage(image);
}

/**
 * Shorthand for generating a simple message embed.
 * 
 * @param title the title of the embed
 * @param icon the embed icon
 * @param message the description for the embed
 * @param image the image for the embed
 * @param thumbnail the thumbnail for the embed
 */
export const generateSimpleEmbedWithImageAndThumbnail = (title: string,
                                                         icon: EmbedIconType | string,
                                                         message: string,
                                                         image: string,
                                                         thumbnail: string) => {
    return generateSimpleEmbed(title, icon, message)
        .setImage(image)
        .setThumbnail(thumbnail);
}

/**
 * Shorthand for generating a complex message embed.
 * 
 * @param title the title of the embed
 * @param icon the embed icon
 * @param message the description for the embed
 * @param fields a list of EmbedFieldData for the embed
 */
export const generateEmbed = (title: string,
                              icon: EmbedIconType | string,
                              message: string,
                              fields: EmbedFieldData[]) => {
    return generateSimpleEmbed(title, icon, message)
        .addFields(fields);
}

/**
 * Shorthand for generating a complex message embed.
 * 
 * @param title the title of the embed
 * @param icon the embed icon
 * @param message the description for the embed
 * @param fields a list of EmbedFieldData for the embed
 * @param thumbnail the thumbnail for the embed
 */
export const generateEmbedWithFieldsAndThumbnail = (title: string,
                                                    icon: EmbedIconType | string,
                                                    message: string,
                                                    fields: EmbedFieldData[],
                                                    thumbnail: string) => {
    return generateSimpleEmbed(title, icon, message)
        .addFields(fields)
        .setThumbnail(thumbnail);
}

/**
 * Shorthand for generating a complex message embed.
 * 
 * @param title the title of the embed
 * @param icon the embed icon
 * @param message the description for the embed
 * @param fields a list of EmbedFieldData for the embed
 * @param image the image for the embed
 */
export const generateEmbedWithFieldsAndImage = (title: string,
                                                icon: EmbedIconType | string,
                                                message: string,
                                                fields: EmbedFieldData[],
                                                image: string) => {
    return generateSimpleEmbed(title, icon, message)
        .addFields(fields)
        .setImage(image);
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
    if (customDate._d === 'Invalid Date'
        || customDate._d === 'Invalid date') {
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

/**
 * Returns the closest matches of the
 * provided valid string array, to the
 * given input string.
 * 
 * @param input the input string
 * @param valid a list of valid strings
 * @param limit the limit of results to return
 */
export const getClosestMatches = (input: string, valid: string[], limit?: number) => {
    let results = valid
        .map(record => {
            return {
                input,
                valid: record,
                score: getJWDistance(input, record)
            }
        })
        .sort((a, b) => b.score - a.score);

    if (limit) {
        results = results.slice(0, Math.min(results.length, limit));
    }

    return results;
}

/**
 * Applies the Jaro-Winkler algorithm
 * to determine the simularity of two
 * strings.
 * 
 * @param input the input string
 * @param valid the valid string
 * @see https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
 */
export const getJWDistance = (input: string, valid: string) => {
    let m = 0;
    let i, j;

    if (input.length === 0 || valid.length === 0) {
        return 0;
    }

    input = input.toUpperCase();
    valid = valid.toUpperCase();

    if (input === valid) {
        return 1;
    }

    let range = (Math.floor(Math.max(input.length, valid.length) / 2)) - 1;
    let inputMatches = new Array(input.length);
    let validMatches = new Array(valid.length);

    for (let i = 0; i < input.length; i++) {
        let low = (i >= range) ? i - range : 0;
        let high = (i + range <= (valid.length - 1)) ? (i + range) : (valid.length - 1);
        for (let j = low; j <= high; j++) {
            if (inputMatches[i] !== true && validMatches[j] !== true && inputMatches[i] === validMatches[j]) {
                ++m;
                inputMatches[i] = validMatches[j] = true;
                break;
            }
        }
    }

    let k = 0;
    let num = 0;

    for (let i = 0; i < input.length; i++) {
        if (inputMatches[i] === true) {
            for (let j = k; j < valid.length; j++) {
                if (validMatches[j] === true) {
                    k = j + i;
                    break;
                }

                if (input[i] !== valid[j]) {
                    ++num;
                }
            }
        }
    }

    let weight = (m / input.length + m / valid.length + (m - (num / 2)) / m) / 3;
    let l = 0;
    let p = 0.1;

    if (weight > 0.7) {
        while (input[l] === valid[l] && l < 4) {
            ++l;
        }

        weight = weight + l * p * (1 - weight);
    }

    return weight;
}

/**
 * Returns the highest clean divisor
 * of a given number, up to max.
 * 
 * (Yes, I know this could probably
 *  be implemented more efficiently
 *  but it's alright)
 * 
 * @param number the number
 * @param max the maximum number
 */
export const getHighestDivisor = (number: number, max: number = number) => {
    let highest = 0;
    for (let i = 0; i < max; i++) {
        if (number % i === 0) {
            highest = i;
        }
    }

    return highest;
}

/**
 * Returns a list of clean divisors
 * of a given number, up to max.
 * 
 * @param number the number
 * @param max the maximum number
 */
export const getDivisors = (number: number, max: number = number) => {
    let arr = [];
    for (let i = 0; i < max; i++) {
        if (number % i === 0) {
            arr.push(i);
        }
    }

    return arr;
}