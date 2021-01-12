import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { GuildPreferences } from './GuildPreferences';

export type ReactionPayload = {
    name: string;
    trigger: string[];
    response: string;
}

@Entity()
export class GuildReactions {

    @PrimaryGeneratedColumn()
    id: string;

    @ManyToOne(() => GuildPreferences, guildPreference => guildPreference.reactions)
    @Column()
    guildId: string;

    @Column('simple-json')
    payload: ReactionPayload[];

}