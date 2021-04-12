import moment from 'moment';
import * as Logger from './logger';

import { Colors } from './logger';

export async function printStartup() {
Logger.unlisted(Colors.GREEN + `
                   |
                  / \\
                 / _ \\            _    _   
                |.o '.|      _ __| | _| |_ 
                |'._.'|     | '__| |/ / __|
                |     |     | |  |   <| |_ 
              ,'|  |  |\`.   |_|  |_|\\_\\\\__|
             /  |  |  |  \\
             |,-'--|--'-.|                                            
` + Colors.RESET);
Logger.unlisted(`            Booting ${Logger.wrap(Colors.GREEN, 'rkt')} version ${Logger.wrap(Colors.DIM, '0.1 (master)')}`);
Logger.unlisted(`                  ILEFA Labs (c) ${moment().format('YYYY')}`);
Logger.unlisted(``);
}