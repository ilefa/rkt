import { Message } from 'discord.js';
import { codeBlock, TestCommand } from '@ilefa/ivy';

export class ListCommandsFlow extends TestCommand {

    constructor() {
        super('listcommands');
    }

    run(message?: Message) {
        message.channel.send(codeBlock('', this.manager.commands.map(cmd => cmd.name).join(', ')));
    }

}