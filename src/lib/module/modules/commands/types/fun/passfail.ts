import { Command, CommandReturn } from '../../command';
import { Message, Permissions, User } from 'discord.js';
import { bold, generateSimpleEmbed, isFC, italic } from '../../../../../util';

const SOE_ROLES = [
    "770717116633448449",
    "770340181144109066",
    "777261226521526273",
    "770358095293317180",
    "767950997578186752",
    "767951021531594822",
    "767950910096932934",
    "777262434947170345",
    "770716732896575568",
    "770340165876973569",
    "770340394717675570"
];

export default class PassFailCommand extends Command {

    constructor() {
        super('pf', 'what', null, [], Permissions.FLAGS.SEND_MESSAGES, false, true);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (!isFC(message.guild)) {
            message.reply(generateSimpleEmbed('.pf | Error', `You cannot run this command in ${bold(message.guild.name)}.`));
            return CommandReturn.EXIT;
        }

        // epic soe person (:
        if (message.member.roles.cache.some(role => SOE_ROLES.includes(role.id))) {
            message.reply('fuck you');
            return CommandReturn.EXIT;
        }

        // non soe loser >:(
        message.reply(`yes ${italic('(fuck you anyways)')}`);
        return CommandReturn.EXIT;
    }

}