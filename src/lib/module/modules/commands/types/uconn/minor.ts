import axios from 'axios';
import cheerio from 'cheerio';
import minors from '../../../../../uconn/minors';

import * as Logger from '../../../../../logger';

import { Command, CommandReturn } from '../../command';
import { Message, Permissions, TextChannel, User } from 'discord.js';
import { PageContent, PaginatedEmbed } from '../../../../../paginator';
import { bold, emboss, generateSimpleEmbed, link } from '../../../../../util';

export type MinorData = {
    name: string;
    url: string;
};

export default class MinorCommand extends Command {

    constructor() {
        super('minor', `Invalid usage: ${emboss('.minor <list | name..>')}`, null, [], Permissions.FLAGS.SEND_MESSAGES);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            return CommandReturn.HELP_MENU;
        }

        if (args[0].toLowerCase() === 'list') {
            let i = 0;
            let temp: MinorData[] = [];
            let pages: PageContent[] = [];
            for (let minor of minors) {
                if (i % 23 === 0 && i !== 0) {
                    let description = '';
                    temp.forEach(record => {
                        description += `${link(record.name, record.url)}\n`;
                    });

                    pages.push({ description, fields: [] });
                    temp = [];
                }

                i++;
                temp.push(minor);
            }

            new PaginatedEmbed(message.channel as TextChannel, user, `UConn Minors (${minors.length})`,
                pages, 600000, 'https://avatars0.githubusercontent.com/u/70737187?s=200&v=4');

            return CommandReturn.EXIT;
        }

        let query = args
            .join('-')
            .toLowerCase();

        let data = await axios
            .get(`https://catalog.uconn.edu/minors/${query}/`)
            .then(res => res.data)
            .catch(err => {
                Logger.except(err, 'Minors', `Failed to query []`);
                return null;
            });

        if (!data) {
            message.reply(generateSimpleEmbed('Minor Search', `Couldn't locate any minors by descriptor ${emboss(args.join(' '))}.`));
            return CommandReturn.EXIT;
        }

        let str = '';
        let $ = cheerio.load(data);
        let title = $('.entry-title').text();
        
        $('p.none').each(i => {
            let element = $(`p.none:nth-child(${i + 1})`);
            str += element.text() + '\n\n';
        });

        message.reply(generateSimpleEmbed(`Minors » ${title.split(' Minor')[0]}`, `${bold(title)}\n\n`
            + `:arrow_right: ${link('Course Catalog', `https://catalog.uconn.edu/minors/${query}/`)}\n\n`
            + `${bold('Description')}\n` 
            + `${str
                    ? str.trimStart()
                    : 'Error retrieving data from the web, please try again later.'}`));

        return CommandReturn.EXIT;
    }

}