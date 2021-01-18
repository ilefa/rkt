import ModuleManager from './manager';

import { Client } from 'discord.js';

export default abstract class Module {

    name: string;
    client: Client;
    manager: ModuleManager;

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Called when the module is enabled.
     */
    abstract start(): void;

    /**
     * Called when the module is disabled.
     */
    abstract end(): void;

}