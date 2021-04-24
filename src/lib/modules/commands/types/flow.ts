import { User, Message } from 'discord.js';
import { EmbedIconType } from '../../../../lib/util';
import { Command, CommandReturn, CUSTOM_PERMS, emboss } from '@ilefa/ivy';

export class FlowCommand extends Command {

    constructor() {
        super('flow', `Invalid usage: ${emboss('.flow <name>')}`, null, [], CUSTOM_PERMS.SUPER_PERMS, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }

        let flow = this.manager.findFlow(args[0]);
        if (!flow) {
            message.reply(this.manager.engine.embeds.build('Test Flow Manager', EmbedIconType.TEST, `Invalid flow: ${emboss(args[0])}.`, null, message));
            return CommandReturn.EXIT;
        }

        flow.command.execute(user, message, args);
        return CommandReturn.EXIT;
    }

}