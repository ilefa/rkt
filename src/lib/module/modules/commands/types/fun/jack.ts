import Jimp from 'jimp'
import mergeImage from 'merge-img';

import { MIME_PNG } from 'jimp';
import { emboss } from '../../../../../util';
import { Command, CommandCategory, CommandReturn } from '../../command';
import { Message, MessageAttachment, Permissions, User } from 'discord.js';

export default class JackCommand extends Command {

    constructor() {
        super('jack', CommandCategory.FUN, `Invalid usage: ${emboss('.jack st<a..>ck')}`, 'jack do be stackin tho :flushed: :flushed: :flushed:', [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }
        
        if (!/sta*ck/g.test(args[0])) {
            return CommandReturn.HELP_MENU;
        }

        let numA = (args[0].match(/a/g) || []).length;
        let imageList = ['assets/top.png'];
        for (; numA > 0; numA--) {
            imageList.push('assets/mid.png')
        }

        imageList.push('assets/bottom.png')
        let mergedImg: Jimp = await mergeImage(imageList, { direction: true });

        mergedImg.getBuffer(MIME_PNG,(_, buffer)=>{
            message.reply(new MessageAttachment(buffer));
        });

        return CommandReturn.EXIT;
    }

}