import Module from '../module';
import * as Logger from '../../logger';

export default class StatusHandlerModule extends Module {

    constructor() {
        super('Status Handler');
    }

    start() {
        process.on('SIGINT', () => this.suicide(this));
        process.on('SIGTERM', () => this.suicide(this));
        process.on('SIGQUIT', () => this.suicide(this));
        process.on('SIGHUP', () => this.suicide(this));
        Logger.info('System', 'Now listening for OS kill signals.');
    }

    end() {}

    suicide(ctx: this) {
        ctx.client.destroy();
        Logger.info('rkt', 'Shutting down..');
        process.exit(0);
    }

}