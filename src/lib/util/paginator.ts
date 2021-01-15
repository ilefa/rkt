import TinyGradient from 'tinygradient';

import { EmbedIconType, generateEmbed } from '.';
import { Instance as TGInst } from 'tinygradient';
import {
    EmbedFieldData,
    Message,
    ReactionCollector,
    TextChannel,
    User
} from 'discord.js';

export type PageContent = {
    description: string,
    fields: EmbedFieldData[]
}

export class PaginatedEmbed {

    title: string;
    icon: EmbedIconType | string;
    pages: PageContent[];
    timeout: number;
    thumbnail: string;
    message: Message;
    channel: TextChannel;
    author: User;
    page: number;
    collector: ReactionCollector;
    colorGradient: TGInst;

    constructor(channel: TextChannel,
                author: User,
                title: string,
                icon: EmbedIconType | string,
                pages: PageContent[],
                timeout: number = 600000,
                thumbnail: string = null,
                beginColor: string = 'black',
                endColor: string = 'green') {
        this.channel = channel;
        this.author = author;
        this.title = title;
        this.icon = icon;
        this.pages = pages;
        this.timeout = timeout;
        this.thumbnail = thumbnail;
        this.page = 1;

        this.colorGradient = TinyGradient([beginColor, endColor]);

        channel
            .send(this.generatePage(this.page))
            .then(msg => this.init(msg));
    }

    private generatePage(pnum: number) {
        let pind = pnum - 1;
        return generateEmbed(this.title, this.icon, this.pages[pind].description, this.pages[pind].fields)
                .setTimestamp()
                .setThumbnail(this.thumbnail)
                .setFooter(`Page ${pnum} of ${this.pages.length}`, this.channel.guild.iconURL())
                .setColor(this.getColor(pind));
    }

    private init(message: Message) {
        this.message = message;

        const filter = (reaction, user) => {
            if (user.bot) return false;
            return true;
        }

        this.collector = message.createReactionCollector(filter, { time: this.timeout });

        this.collector.on('collect', (reaction, user) => {
            if (this.functionMap.get(reaction.emoji.name)(this)) {
                this.message.edit(this.generatePage(this.page));
            }

            reaction.users.remove(user);
        });

        this.collector.on('end', () => {
            message.reactions.removeAll();
        })

        this.functionMap.forEach((_, emote) => {
            message.react(emote);
        });
    }

    private prevPage(ctx: PaginatedEmbed): boolean {
        if (ctx.page < 2) return false;
        ctx.page--;
        return true;
    }

    private nextPage(ctx: PaginatedEmbed): boolean {
        if (ctx.page >= ctx.pages.length) return false;
        ctx.page++;
        return true;
    }

    private firstPage(ctx: PaginatedEmbed): boolean {
        if (ctx.page === 1) return false;
        ctx.page = 1;
        return true;
    }

    private lastPage(ctx: PaginatedEmbed): boolean {
        if (ctx.page === ctx.pages.length) return false;
        ctx.page = ctx.pages.length;
        return true;
    }

    private functionMap: Map<string, (ctx: PaginatedEmbed) => boolean> = new Map([
        ['⬅️', this.firstPage],
        ['◀️', this.prevPage],
        ['▶️', this.nextPage],
        ['➡️', this.lastPage]
    ]);

    private getColor(index) {
        let val = index / ( this.pages.length - 1);
        return this.colorGradient.rgbAt(val).toHexString();
    }

}

