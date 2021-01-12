import MultiCommand from './multi';
import Module from '../../../module';

import { Message, User } from 'discord.js';

export default abstract class CommandComponent<M extends Module> {

    name: string;
    help: string;
    manager: M;
    host: MultiCommand<M>;
    permission: number;

    constructor(name: string, help: string, permission: number) {
        this.name = name;
        this.help = help;
        this.permission = permission;
    }

    abstract execute(user: User, message: Message, args: string[]);

}