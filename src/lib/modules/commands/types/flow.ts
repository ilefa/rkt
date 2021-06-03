import { User, Message } from 'discord.js';
import { EmbedIconType } from '../../../util';
import { Command, CommandReturn, CustomPermissions, emboss } from '@ilefa/ivy';

export class FlowCommand extends Command {

    constructor() {
        super('flow', `Invalid usage: ${emboss('.flow <name>')}`, null, [], CustomPermissions.SUPER_PERMS, false, false, [], [], true);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }

        let flow = this.manager.findFlow(args[0]);
        if (!flow) {
            message.reply(this.embeds.build('Test Flow Manager', EmbedIconType.TEST, `Invalid flow: ${emboss(args[0])}.`, null, message));
            return CommandReturn.EXIT;
        }

        flow.command.execute(user, message, args);
        return CommandReturn.EXIT;
    }

}