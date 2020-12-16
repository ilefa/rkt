import CountHerManager from '../../lib/counther/manager';

import { Message, Permissions, User } from 'discord.js';
import { Command, CommandReturn } from '../command';
import { emboss, generateEmbed, generateSimpleEmbed, italic } from '../../lib/util';

export default class CountHerCommand extends Command {

    countHerManager: CountHerManager;

    constructor(countHerManager: CountHerManager) {
        super('counther', `Invalid usage: ${emboss('.counther <target>')}`, null, [], Permissions.FLAGS.ADMINISTRATOR);
        this.countHerManager = countHerManager;
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        message.delete();

        if (args.length !== 1) {
            return CommandReturn.HELP_MENU;
        }

        if (isNaN(parseInt(args[0]))) {
            message.reply(generateSimpleEmbed('CountHer', 'The provided target number is not valid.'));
            return CommandReturn.EXIT;
        }

        if (this.countHerManager.isMaxed()) {
            message.reply(generateSimpleEmbed('CountHer', 'There are too many lobbies running right now, please try again later.'));
            return CommandReturn.EXIT;
        }

        let target = parseInt(args[0]);
        let channel = await this.countHerManager.generateChannel(message, user, target);
        if (!channel) {
            message.reply(generateSimpleEmbed('CountHer', `Failed to create a channel for you.\n${italic('(Do I have the right permissions?)')}`));
            return CommandReturn.EXIT;
        }

        let result = this.countHerManager.createLobby(channel.id, target);
        if (!result) {
            message.reply(generateSimpleEmbed('CountHer', 'Failed to create a lobby for you.'));
            return CommandReturn.EXIT;
        }

        message.reply(generateEmbed('CountHer', 'Successfully created a lobby for you!', [
            {
                name: 'Game Channel',
                value: `<#${channel.id}>`,
                inline: true
            }
        ]));
        return CommandReturn.EXIT;
    }

}