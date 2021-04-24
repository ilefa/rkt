import { Guild } from 'discord.js';
import { GuildDataProvider, GuildTokenLike } from '@ilefa/ivy';

export default class DataProvider implements GuildDataProvider<GuildTokenLike> {
    
    load = async (_guild: Guild): Promise<GuildTokenLike> => {
        return {
            prefix: '.'
        }
    } 
    
    save(_guild: Guild, _data: GuildTokenLike): void {}

}