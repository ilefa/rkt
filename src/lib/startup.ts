import moment from 'moment';
import * as Logger from './logger';

import { Colors } from './logger';

export function printStartup() {
Logger.unlisted(Colors.GREEN + `
                 /$$                         /$$                
                | $$                        | $$                
      /$$$$$$$ /$$$$$$    /$$$$$$  /$$$$$$$ | $$   /$$  /$$$$$$$
     /$$_____/|_  $$_/   /$$__  $$| $$__  $$| $$  /$$/ /$$_____/
    |  $$$$$$   | $$    | $$  \\ $$| $$  \\ $$| $$$$$$/ |  $$$$$$ 
     \\____  $$  | $$ /$$| $$  | $$| $$  | $$| $$_  $$  \\____  $$
     /$$$$$$$/  |  $$$$/|  $$$$$$/| $$  | $$| $$ \\  $$ /$$$$$$$/
    |_______/    \\___/   \\______/ |__/  |__/|__/  \\__/|_______/                                              
` + Colors.RESET);
Logger.unlisted(`                Booting ${Logger.wrap(Colors.GREEN, 'Stonks')} version ${Logger.wrap(Colors.DIM, '0.1 (master)')}`);
Logger.unlisted(`                       ILEFA Labs (c) ${moment().format('YYYY')}`);
Logger.unlisted(``);
}