import Module from './module';
import * as Logger from '../logger';

import { Client } from 'discord.js';
import { numberEnding } from '../util';

export default class ModuleManager {

    client: Client;
    modules: Module[];

    constructor(client: Client) {
        this.client = client;
        this.modules = [];
    }

    /**
     * Registers a module into the manager.
     * @param module the module
     */
    registerModule(module: Module) {
        module.client = this.client;
        module.manager = this;
        module.start();

        this.modules.push(module);
    }

    init() {
        Logger.info('Modules', `Loaded & Enabled ${this.modules.length} module${numberEnding(this.modules.length)}.`);
    }

    disable() {
        this.modules.forEach(module => module.end());
        this.modules = [];
    }

}