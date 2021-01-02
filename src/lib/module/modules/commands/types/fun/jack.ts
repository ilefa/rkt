import { Message, MessageAttachment, Permissions, User } from 'discord.js';
import { Command, CommandReturn } from '../../command';
import Jimp, { MIME_PNG } from 'jimp'

import mergeImage from 'merge-img';

export default class JackCommand extends Command {

    constructor() {
        super('jack', `jack stack`, 'jack is a stack', [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }
        if (!/sta*ck/g.test(args[0])) {
            return CommandReturn.HELP_MENU;
        }
        let numA = (args[0].match(/a/g) || []).length;
        let imageList = ['src/lib/module/modules/commands/types/fun/assets/top.png'];
        for (; numA > 0; numA--) {
            imageList.push('src/lib/module/modules/commands/types/fun/assets/mid.png')
        }

        imageList.push('src/lib/module/modules/commands/types/fun/assets/bottom.png')
        let mergedImg: Jimp = await mergeImage(imageList, { direction: true });

        mergedImg.getBuffer(MIME_PNG,(_, buffer)=>{
            message.reply(new MessageAttachment(buffer));
        });

        return CommandReturn.EXIT;
    }

}