import { Message, MessageReaction, User } from "discord.js";
import { asMention, generateEmbed, RESPONSE_GROUP_EMOJI, RESPONSE_GROUP_EMOJI_RAW } from "../../util";
import Module from "../module";

export default class PollManager extends Module {

    constructor() {
        super('Polls');
    }

    start() {}

    end() {}

    async handleAdd(reaction: MessageReaction, user: User) {
        let message = reaction.message.partial ? await reaction.message.fetch() : reaction.message;

        await Promise.all(message.reactions.cache.map(async (oldReact) => {
            if (oldReact.emoji.name ===  reaction.emoji.name) return;
            if (!oldReact.users.cache.size) await oldReact.users.fetch();
            oldReact.users.cache.forEach((testUser, key)=>{
                if (testUser.id === user.id) {
                    oldReact.users.remove(user);
                    oldReact.users.cache.delete(key);
                }
            })
        }));

        await this.handle(reaction);
    }

    async handle(reaction: MessageReaction) {
        let message = reaction.message.partial ? await reaction.message.fetch() : reaction.message;

        let fields = [];
        let questionString = this.getQuestionString(message);
        let reactionMap = this.isComplex(message) ? this.getResponses(message) : this.basicMap;

        await Promise.all(message.reactions.cache.map(async (reaction)=>{
            let title = reactionMap.get(reaction.emoji.name);
            if (!title) return;

            title += ` (${reaction.count - 1})`;

            let players = '';
            if (!reaction.users.cache.size) await reaction.users.fetch();
            reaction.users.cache.forEach((user)=>{
                if(user.bot) return;
                players += asMention(user) + '\n';
            })
            if (players === '') return;
            fields.push({
                name: title,
                value: players,
                inline: true
            })
        }));

        if (fields.length === 0) fields.push({
            name: '‎',
            value: 'No Responses :('
        })
        await message.edit(generateEmbed('Polls', questionString, fields));
    }

    async handleSimple(message: Message) {
        this.basicMap.forEach((_,emote)=>message.react(emote));
    }

    private getQuestionString(message: Message): string {
        return message.embeds[0].description;
    }

    private isComplex(message: Message): boolean {
        return message.embeds[0].description.includes('Responses');
    }

    private getResponses(message: Message): Map<string, string> {
        let responses = message.embeds[0].description.split('Responses')[1].split('**')[1].split('\n').slice(1);
        let map = new Map<string, string>();
        responses.forEach((str)=>{
            let [key, value] = str.split(' ');
            map.set(RESPONSE_GROUP_EMOJI_RAW[RESPONSE_GROUP_EMOJI.indexOf(key)], value);
        })
        return map;
    }

    private basicMap = new Map([
        ['👍', 'Yes'],
        ['👎', 'No'],
        ['🤷', 'Doesn\'t Care']
    ])

}