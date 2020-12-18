import { Guild } from "discord.js";
import { Guild as StonksGuild } from "../entity/Guild";
import { EntityRepository, AbstractRepository } from "typeorm";

@EntityRepository(StonksGuild)
export class GuildRepository extends AbstractRepository<StonksGuild> {

    async find(guild: Guild) {
        return await this.findById(guild.id);
    }

    async findById(id: string) {
        return await this.repository.findOne({ guildId: id });
    }

    async getPreferences(id: string) {
        let guild = await this.findById(id);
        if (!guild) {
            return null;
        }

        return guild.prefs;
    }

}