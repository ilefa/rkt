import { Message, User } from 'discord.js';
import { EmbedIconType } from '../../../util';

import {
    emboss,
    bold,
    CommandReturn,
    codeBlock,
    Command,
    CustomPermissions,
    conforms
} from '@ilefa/ivy';

const HEADER = /^`{3}(?:ts|js)\n/;

export class EvalCommand extends Command {

    constructor() {
        super('eval', `Invalid usage: ${emboss('.eval <executable..>')}`, null, [
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
        ], CustomPermissions.SUPER_PERMS, false);
    }

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        if (args.length === 0) {
            return CommandReturn.HELP_MENU;
        }
        
        let exec = args.join(' ');
        if (conforms(HEADER, exec)) {
            exec = exec
                .split(HEADER)[1]
                .split('```')[0];
        }

        try {
            let res = eval(exec);
            message.reply(this.embeds.build('Eval', EmbedIconType.TEST, '', [
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
            ], message));
        } catch (e) {
            message.reply(this.embeds.build('Eval', EmbedIconType.ERROR, 'Encountered an exception while executing your request.', [
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
            ], message))
        }

        return CommandReturn.EXIT;
    }

}