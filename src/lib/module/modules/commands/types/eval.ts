import { Message, User } from 'discord.js';
import { Command, CommandCategory, CommandReturn } from '../command';
import {
    bold,
    codeBlock,
    CUSTOM_PERMS,
    EmbedIconType,
    emboss,
    generateEmbed
} from '../../../../util';

const HEADER = /^`{3}(?:ts|js)\n/;

export default class EvalCommand extends Command {

    constructor() {
        super('eval', CommandCategory.MISC, `Invalid usage: ${emboss('.eval <executable..>')}`, null, [
            {
                name: 'Args',
                value: `${bold('__executable__')}: executable js/ts instructions`,
                inline: false
            },
            {
                name: 'Valid Executable Specification',
                value: `There are two main ways to specify executable code to run:\n` 
                     + `${bold('1.')} Type out the raw code to execute\n` 
                     + `${bold('2.')} Use a codeblock and type out the code there.\n` 
                     + ` • You must use type JS or TS as the language specifier.`,
                inline: false
            }
        ], CUSTOM_PERMS.SUPERMAN, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            return CommandReturn.HELP_MENU;
        }
        
        let exec = args.join(' ');
        if (HEADER.test(exec)) {
            exec = exec
                .split(HEADER)[1]
                .split('```')[0];
        }

        try {
            let res = eval(exec);
            message.reply(generateEmbed('Eval', EmbedIconType.TEST, '', [
                {
                    name: 'Command',
                    value: codeBlock('ts', exec),
                    inline: false
                },
                {
                    name: 'Output',
                    value: codeBlock('', res),
                    inline: false
                }
            ]));
        } catch (e) {
            message.reply(generateEmbed('Eval', EmbedIconType.ERROR, 'Encountered an exception while executing your request.', [
                {
                    name: 'Command',
                    value: codeBlock('ts', exec),
                    inline: false
                },
                {
                    name: 'Error',
                    value: codeBlock('', e.message),
                    inline: false
                }
            ]))
        }

        return CommandReturn.EXIT;
    }

}