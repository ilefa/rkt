import Module from '../module';
import { Message } from 'discord.js';

export default class PollManager extends Module {

    constructor() {
        super('Polls');
    }

    start() {}
    
    end() {}

    async handle(message: Message) {
        ['👍', '👎', '🤷'].map(async emote => await message.react(emote));
    }

}