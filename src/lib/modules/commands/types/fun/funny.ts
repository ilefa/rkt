import fs from 'fs';
import ensure from 'validator';

import { execSync } from 'child_process';
import { EmbedIconType } from '../../../../util';
import { Message, MessageAttachment, User } from 'discord.js';
import { Command, CommandReturn, CustomPermissions, emboss } from '@ilefa/ivy';

export class FunnyCommand extends Command {

    constructor() {
        super('funny', `Invalid usage: ${emboss('.funny <display url> <secondary url>')}`, null, [], CustomPermissions.SUPER_PERMS);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 2) {
            return CommandReturn.HELP_MENU;
        }

        let url1 = args[0];
        let url2 = args[1];

        if (!ensure.isURL(url1) || !ensure.isURL(url2)) {
            message.reply(this.embeds.build('Funny', EmbedIconType.TEST, ensure.isURL(url1)
                ? ':link: Display URL is not valid.' 
                : ':link: Secondary URL is not valid.', [], message));
            return CommandReturn.EXIT;
        }

        execSync(`mkdir tmp`);
        execSync(`curl -o ./tmp/display.mp4 ${url1}`);
        execSync(`curl -o ./tmp/second.mp4 ${url2}`);
        execSync('ffmpeg -i ./tmp/second.mp4 -pix_fmt yuv444p ./tmp/second-new.mp4');
        execSync('touch ./tmp/instruct.txt');
        execSync('echo "file display.mp4\nfile second-new.mp4" >> ./tmp/instruct.txt');
        execSync('ffmpeg -f concat -i ./tmp/instruct.txt -codec copy ./tmp/out.mp4');
        execSync('rm ./tmp/second-new.mp4');
        execSync('rm ./tmp/instruct.txt');

        let file = fs.readFileSync('./tmp/out.mp4');
        let attach = new MessageAttachment(file, 'out.mp4');
        
        message.channel.send(attach);
        execSync('rm -rf tmp');

        return CommandReturn.EXIT;
    }

}