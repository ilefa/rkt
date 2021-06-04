import { Message } from 'discord.js';
import { codeBlock, TestCommand } from '@ilefa/ivy';

export class ListFlowsFlow extends TestCommand {

    constructor() {
        super('listflows');
    }

    run(message?: Message) {
        message.channel.send(codeBlock('', this.manager.testFlows.map(flow => flow.name).join(', ')));
    }

}