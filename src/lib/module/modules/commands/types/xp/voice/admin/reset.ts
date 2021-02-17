import CommandComponent from '../../../../components/component';

import { CommandReturn } from '../../../../command';
import { User, Message, Permissions } from 'discord.js';
import { VoiceBoardManager } from '../../../../../vcboard';
import {
    asMention,
    EmbedIconType,
    emboss,
    findUser,
    generateSimpleEmbed
} from '../../../../../../../util';

export default class ResetClientCommand extends CommandComponent<VoiceBoardManager> {

    constructor() {
        super('reset', 'reset [target]', Permissions.FLAGS.ADMINISTRATOR);
    }

    async execute(user: User, message: Message, args: string[]) {
        if (args.length > 1) {
            return CommandReturn.HELP_MENU;
        }

        if (message.mentions.members.size > 1) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board`, EmbedIconType.XP, `Excess targets: ${emboss(args.join(' '))}`));
            return CommandReturn.EXIT;
        }

        let target: User = await findUser(message, args[0], null);
        if (!target) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board`, EmbedIconType.XP, `Invalid or unknown target: ${emboss(args[0] || '[missing]')}`));
            return CommandReturn.EXIT;
        }

        let result = await this.manager.reset(message.guild.id, target.id);
        if (!result) {
            message.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board`, EmbedIconType.XP, `Failed to reset record for ${asMention(target)}.`));
            return CommandReturn.EXIT;
        }

        message.reply(generateSimpleEmbed(`${message.guild.name} - Voice Board`, EmbedIconType.XP, `Successfully reset ${asMention(target)}'s records.`));
        return CommandReturn.EXIT;
    }

}