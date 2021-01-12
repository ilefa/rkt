import { GuildPreferences } from './GuildPreferences';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

export type XpRecord = {
    client: {
        id: string;
        name: string;
        discriminator: string;
    };
    time: string;
    level: number;
    position: number;
    messages: number;
    experience: number;
}

@Entity()
export class GuildXpRecord {

    @PrimaryGeneratedColumn()
    id: string;

    @ManyToOne(() => GuildPreferences, guildPreferences => guildPreferences.xpRecords)
    guildId: string;

    @Column()
    time: string;

    @Column('simple-json')
    record: XpRecord[];

}