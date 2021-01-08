import { Message, TextChannel, User } from 'discord.js';
import { PaginatedEmbed } from '../../../../../paginator';
import { CUSTOM_PERMS, emboss } from '../../../../../util';
import { Command, CommandReturn } from '../../command';

export default class SayCommand extends Command {

    constructor() {
        super('say', `Invalid usage: ${emboss('.say <message..>')}`, null, [], CUSTOM_PERMS.SUPERMAN);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length < 1) return CommandReturn.HELP_MENU;
        // message.channel.send(args.join(' '));

        new PaginatedEmbed(message.channel as TextChannel, user, 'Hi!', [
            {
                description: 'Page 1',
                fields: [
                    {
                        name: '1',
                        value: 'Page 1 Field'
                    }
                ]
            },
            {
                description: 'Page 2',
                fields: [
                    {
                        name: '1',
                        value: 'Page 2 Field 1'
                    },
                    {
                        name: '2',
                        value: 'Page 2 Field 2'
                    }
                ]
            },
            {
                description: 'Page 3',
                fields: [
                    {
                        name: '1',
                        value: 'Page 3 Field 1'
                    },
                    {
                        name: '2',
                        value: 'Page 3 Field 2'
                    },
                    {
                        name: '3',
                        value: 'Page 3 Field 3'
                    }
                ]
            },
        ]);

        return CommandReturn.EXIT;
    }

}