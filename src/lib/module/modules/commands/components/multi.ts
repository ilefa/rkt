import Module from '../../../module';
import CommandComponent from './component';
import env from '../../../../../../env.json';

import { Command, CommandReturn } from '../command';
import { EmbedFieldData, Message, User } from 'discord.js';
import { bold, EmbedIconType, generateSimpleEmbed } from '../../../../util';

export default abstract class MultiCommand<M extends Module> extends Command {
    
    base: string;
    baseManager: M;
    basePermission: number;
    components: Map<string, CommandComponent<M>>;

    constructor(base: string, basePermission: number, baseManager: M) {
        super(base, 'Invalid usage, please reference the command list below.', null, [], basePermission);

        this.base = base;
        this.baseManager = baseManager;
        this.basePermission = basePermission;
        this.components = new Map<string, CommandComponent<M>>();

        this.registerComponents();
        this.generateHelpFields();
    }

    /**
     * Intended to be used to register all
     * known components for a MultiCommand.
     */
    abstract registerComponents(): void;

    async execute(user: User, message: Message, args: string[]): Promise<CommandReturn> {
        let component = this.getComponent(args);
        if (!component) {
            return CommandReturn.HELP_MENU;
        }

        if (!message
                .guild
                .member(user)
                .hasPermission(component.permission) 
                && !env
                    .superPerms
                    .some(id => user.id === id)) {
            message.reply(generateSimpleEmbed('Whoops', EmbedIconType.ERROR, `You don't have permission to do this.`));
            return CommandReturn.EXIT;
        }

        let newArgs = args.slice(1);
        return component.execute(user, message, newArgs);
    }

    register(components: CommandComponent<M> | CommandComponent<M>[]) {
        if (components instanceof CommandComponent) {
            components.manager = this.baseManager;
            components.host = this;
            this.components.set(components.name, components);
            return;
        }

        components.forEach(component => {
            component.manager = this.baseManager;
            component.host = this;
            this.components.set(component.name, component);
        });
    }

    private getComponent(args: string[]): CommandComponent<M> {
        return this.components.get(args[0]?.toLowerCase());
    }

    private generateHelpFields() {
        let helpStr = '';
        this.components.forEach((v, k) => {
            if (v.help === v.name) {
                helpStr += bold('.' + this.base + ' ' + v.name) + '\n';
                return;
            }

            helpStr += bold('.' + this.base + ' ' + v.name) + ' ' + v.help.split(v.name)[1].trim() + '\n';
        });

        let helpField: EmbedFieldData = {
            name: 'Command List',
            value: helpStr.trim(),
            inline: false
        }

        this.helpFields = [helpField, ...this.helpFields];
    }

}