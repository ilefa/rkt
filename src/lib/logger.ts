import moment from 'moment';

export enum Colors {
    RESET = "\x1b[0m",
    BRIGHT = "\x1b[1m",
    DIM = "\x1b[2m",
    UNDERSCORE = "\x1b[4m",
    BLINK = "\x1b[5m",
    REVERSE = "\x1b[7m",
    HIDDEN = "\x1b[8m",

    BLACK = "\x1b[30m",
    RED = "\x1b[31m",
    GREEN = "\x1b[32m",
    YELLOW = "\x1b[33m",
    BLUE = "\x1b[34m",
    MAGENTA = "\x1b[35m",
    CYAN = "\x1b[36m",
    WHITE = "\x1b[37m",

    BG_BLACK = "\x1b[40m",
    BG_RED = "\x1b[41m",
    BG_GREEN = "\x1b[42m",
    BG_YELLOW = "\x1b[43m",
    BG_BLUE = "\x1b[44m",
    BG_MAGENTA = "\x1b[45m",
    BG_CYAN = "\x1b[46m",
    BG_WHITE = "\x1b[47m"
}

export const Levels = Object.freeze({
    'INFO': {
        color: Colors.GREEN,
        text: 'INFO',
        symbol: '*'
    },
    'DEBUG': {
        color: Colors.CYAN,
        text: 'DEV',
        symbol: 'ℹ'
    },
    'WARN': {
        color: Colors.YELLOW,
        text: 'WARN',
        symbol: '⚠'
    },
    'ERROR': {
        color: Colors.RED,
        text: 'ERR',
        symbol: '✖'
    }
});

/**
 * Logs a message
 * @param color    the color of the header
 * @param header   the module header
 * @param message  the message
 */
export const log = (level, header: string, message: string) => {
    if (!(level instanceof Object)) {
        console.log(`${wrap(Levels.WARN.color, Levels.WARN.symbol)} An error occurred while logging a message.`);
        return;
    }

    console.log(`${Colors.WHITE + '[' + moment().format('M/D/YYYY h:mm:ss A') + ']' + Colors.DIM} ${wrap(level.color, level.text)}${' '.repeat((level.text === Levels.ERROR.text || level.text === Levels.DEBUG.text) ? 2 : 1) + Colors.YELLOW + '|' + Colors.WHITE + ' [' + header + ']'} ${Colors.RESET + message}`);
}

/**
 * Logs a message to stdout.
 * @param message the message
 */
export const unlisted = (message: string) => console.log(message);

/**
 * Logs an informational message
 * @param header   the module header
 * @param message  the message
 */
export const info = (header: string, message: string) => log(Levels.INFO, header, message);

/**
 * Logs a warning
 * @param header   the module header
 * @param message  the message
 */
export const warn = (header: string, message: string) => log(Levels.WARN, header, message);

/**
 * Logs an error
 * @param header   the module header
 * @param message  the message
 */
export const severe = (header: string, message: string) => log(Levels.ERROR, header, message);

/**
 * Logs a thrown exception
 *
 * @param exception  the thrown exception
 * @param header     the module header
 * @param base       the base of the error
 */
export const except = <T extends Error>(exception: T, header: string, base: string) => log(Levels.ERROR, header, base + ': ' + exception);

/**
 * Wraps a string in a color
 * @param {Colors} color   the color to wrap it in
 * @param {string} content the content to be wrapped 
 */
export const wrap = (color: Colors, content: string) => `${color + content + Colors.RESET}`;