import moment from 'moment';

import { Colors, IvyEngine, StartupRunnable } from '@ilefa/ivy';

export default class Watermark implements StartupRunnable {
    run(engine: IvyEngine): void {
        let { logger } = engine;
logger.unlisted(Colors.GREEN + `
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
logger.unlisted(`            Booting ${logger.wrap(Colors.GREEN, 'rkt')} version ${logger.wrap(Colors.DIM, '0.1 (master)')}`);
logger.unlisted(`                  ILEFA Labs (c) ${moment().format('YYYY')}`);
logger.unlisted(``);
    }
}