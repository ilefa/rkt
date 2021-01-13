import {
    asMention,
    bold,
    generateEmbed,
    generateSimpleEmbed,
    getLatestTimeValue,
    join,
    JOIN_BUTTON,
    numberEnding
} from '.';

import {
    Message,
    MessageEmbed,
    MessageReaction,
    ReactionCollector,
    TextChannel,
    User
} from 'discord.js';

export class GameEmbedAwaiter {

    channel: TextChannel;
    message: Message;
    title: string;
    min: number;
    max: number;
    timeout: number;
    initialCountdown: number;
    countdown: number;
    users: User[];
    updater: NodeJS.Timer;
    collector: ReactionCollector;
    then: (users: User[]) => void;
    unless: (user: User) => boolean;

    /**
     * Constructs a pending game embed.
     * 
     * @param channel the channel to send the embed in
     * @param title the title of the embed
     * @param min the minimum players required to start
     * @param max the maximum players allowed in the game
     * @param countdown the countdown time for the game
     * @param timeout the timeout until it will stop looking for players
     * @param then what to do if the game is supposed to start
     * @param unless filters out users reacting to the embed
     */
    constructor(channel: TextChannel,
                title: string,
                min: number,
                max: number,
                countdown: number,
                timeout: number,
                then: (users: User[]) => void,
                unless: (user: User) => boolean) {
        this.channel = channel;
        this.title = title;
        this.min = min;
        this.max = max;
        this.countdown = countdown;
        this.initialCountdown = countdown;
        this.timeout = timeout;
        this.users = [];
        this.then = then;
        this.unless = unless;

        channel
            .send(this.generateMessage())
            .then(message => {
                this.message = message;
                this.init(message);
            });
    }

    private init(message: Message) {
        this.collector = message.createReactionCollector((_, user: User) => !user.bot, {
            maxUsers: this.max,
            time: this.timeout,
            dispose: true
        });

        this.collector.on('collect', (rxn: MessageReaction, user: User) => {
            let checkId = rxn.emoji.id 
                ? rxn.emoji.id 
                : rxn.emoji.name;
            
            if (checkId !== '798763992813928469') {
                return;
            }

            if (this.users.includes(user)) {
                return;
            }

            this.users.push(user);
            this.editMessage();
        });

        this.collector.on('remove', (rxn: MessageReaction, user: User) => {
            let checkId = rxn.emoji.id 
                ? rxn.emoji.id 
                : rxn.emoji.name;

            if (checkId !== '798763992813928469') {
                return;
            }

            this.users = this.users.filter(u => u.id !== user.id);
            this.editMessage();
        })

        this.collector.on('end', (_, reason) => {
            if (reason === 'time') {
                this.timeOut();
            }

            if (reason === 'userLimit') {
                message.delete();
                this.then(this.users);
                return;
            }

            if (reason === 'messageDelete') {
                return;
            }

            message.reactions.removeAll();
        })

        message.react(JOIN_BUTTON);

        this.updater = setInterval(() => {
            if (this.canStart()) {
                this.countdown--;
            }

            if (!this.canStart() && this.countdown !== this.initialCountdown) {
                this.countdown = this.initialCountdown;
            }

            if (this.canStart() && this.countdown === 0) {
                message.delete();
                clearInterval(this.updater);
                return this.then(this.users);
            }

            if (this.canStart() && this.countdown % 5 == 0) {
                this.editMessage();
            }
        }, 1000);
    }

    private generateMessage(): MessageEmbed {
        return generateEmbed(this.title,
            this.canStart() 
                ? `The game will start in ${bold(getLatestTimeValue(this.countdown * 1000))}.` 
                : `Waiting for ${bold(this.min - this.users.length)} more player${numberEnding(this.min - this.users.length)}.` 
            + `\nReact with ${JOIN_BUTTON} to join!`,
            [
                {
                    name: `Players (${this.users.length})`,
                    value: join(this.users, '\n', user => asMention(user)) || 'Nobody',
                }
            ]);
    }

    private async editMessage(): Promise<void> {
        if (!this.message) {
            return;
        }

        await this.message.edit(this.generateMessage());
    }

    private async timeOut(): Promise<void> {
        if (!this.message) {
            return;
        }

        await this.message.edit(generateSimpleEmbed(this.title, ':hourglass_flowing_sand: The game has timed out waiting for new players.'));
    }

    private canStart(): boolean {
        return this.users.length >= this.min;
    }

}