import { GuildPreferences } from './GuildPreferences';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class Guild {

    @PrimaryGeneratedColumn()
    sid: number;

    @Column()
    guildId: string;

    @Column()
    joinedTime: number;

    @OneToOne(() => GuildPreferences)
    @JoinColumn()
    prefs: GuildPreferences;

}