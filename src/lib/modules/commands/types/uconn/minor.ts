import axios from 'axios';
import cheerio from 'cheerio';
import minors from '../../../../util/uconn/minors';

import { EmbedIconType } from '../../../../util';
import { Message, Permissions, TextChannel, User } from 'discord.js';

import {
    bold,
    Command,
    CommandReturn,
    emboss,
    join,
    link,
    PageContent,
    PaginatedEmbed
} from '@ilefa/ivy';

export type MinorData = {
    name: string;
    url: string;
};

export class MinorCommand extends Command {

    constructor() {
        super('minor', `Invalid usage: ${emboss('.minor <list | name..>')}`, null, [], Permissions.FLAGS.SEND_MESSAGES, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            return CommandReturn.HELP_MENU;
        }

        if (args[0].toLowerCase() === 'list') {
            let transform = (pageItems: MinorData[]): PageContent => {
                return {
                    description: join(pageItems, '\n', minor => `${link(minor.name, minor.url)}`),
                    fields: []
                }
            }

            let icon = 'https://avatars0.githubusercontent.com/u/70737187?s=200&v=4';

            PaginatedEmbed.ofItems<MinorData>(this.manager.engine,
                message.channel as TextChannel, user, `UConn Minors (${minors.length})`,
                EmbedIconType.UCONN, minors, 20, transform, 600000, icon);

            return CommandReturn.EXIT;
        }

        let query = args
            .join('-')
            .toLowerCase();

        let data = await axios
            .get(`https://catalog.uconn.edu/minors/${query}/`)
            .then(res => res.data)
            .catch(err => {
                this.logger.except(err, 'Minors', `Failed to query ${query}`);
                return null;
            });

        if (!data) {
            message.reply(this.embeds.build('Minor Search', EmbedIconType.UCONN, `Couldn't locate any minors by the name of ${emboss(args.join(' '))}.`, null, message));
            return CommandReturn.EXIT;
        }

        let str = '';
        let $ = cheerio.load(data);
        let title = $('.entry-title').text();
        
        $('p.none').each(i => {
            let element = $(`p.none:nth-child(${i + 1})`);
            str += element.text() + '\n\n';
        });

        message.reply(this.embeds.build(`Minors » ${title.split(' Minor')[0]}`, EmbedIconType.UCONN, `${bold(title)}\n\n`
            + `:arrow_right: ${link('Course Catalog', `https://catalog.uconn.edu/minors/${query}/`)}\n\n`
            + `${bold('Description')}\n` 
            + `${str
                    ? str.trimStart()
                    : 'Error retrieving data from the web, please try again later.'}`, null, message));

        return CommandReturn.EXIT;
    }

}