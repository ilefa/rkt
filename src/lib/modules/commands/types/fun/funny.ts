import fs from 'fs';
import ensure from 'validator';

import { execSync } from 'child_process';
import { EmbedIconType } from '../../../../util';
import { Message, MessageAttachment, User } from 'discord.js';

import {
    Command,
    CommandReturn,
    CustomPermissions,
    emboss,
    endLoader,
    LOADER,
    startLoader
} from '@ilefa/ivy';

export class FunnyCommand extends Command {

    constructor() {
        super('funny', `Invalid usage: ${emboss('.funny <display url> <secondary url>')}`, null, [], CustomPermissions.SUPER_PERMS);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length !== 2) {
            return CommandReturn.HELP_MENU;
        }

        let [url1, url2] = args;
        if (!ensure.isURL(url1) || !ensure.isURL(url2)) {
            message.reply(this.embeds.build('Funny', EmbedIconType.TEST, ensure.isURL(url1)
                ? ':link: Display URL is not valid.' 
                : ':link: Secondary URL is not valid.', [], message));
            return CommandReturn.EXIT;
        }

        let loader = await startLoader(message);
        
        this.postStatus(loader.message, `${LOADER} Downloading assets..`);
        this.exec(`mkdir tmp`);
        this.exec(`curl -o ./tmp/display.mp4 ${url1}`);
        this.exec(`curl -o ./tmp/second.mp4 ${url2}`);

        this.postStatus(loader.message, `${LOADER} Encoding media..`);
        this.exec('ffmpeg -i ./tmp/second.mp4 -pix_fmt yuv444p ./tmp/second-new.mp4');
        this.exec('touch ./tmp/instruct.txt');
        this.exec('echo "file display.mp4\nfile second-new.mp4" >> ./tmp/instruct.txt');
        this.exec('ffmpeg -f concat -i ./tmp/instruct.txt -codec copy ./tmp/out.mp4');
        this.exec('rm ./tmp/second-new.mp4');
        this.exec('rm ./tmp/instruct.txt');

        let file = fs.readFileSync('./tmp/out.mp4');
        let attach = new MessageAttachment(file, 'out.mp4');
        
        this.postStatus(loader.message, `${LOADER} Uploading media..`);
        message.channel.send(attach).then(_ => endLoader(loader));

        this.exec('rm -rf tmp');

        return CommandReturn.EXIT;
    }

    private exec = (cmd: string) => execSync(cmd, { stdio: 'ignore' });
    private postStatus = (msg: Message, status: string) => msg.edit(status);

}