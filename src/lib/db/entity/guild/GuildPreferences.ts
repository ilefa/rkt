import { GuildXpRecord } from './GuildXpRecord';
import { GuildReactions } from './GuildReactions';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany } from 'typeorm';

@Entity()
export class GuildPreferences {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    guildId: string;

    @Column()
    prefix: string;

    @Column()
    debug: boolean;

    @OneToMany(() => GuildReactions, guildReaction => guildReaction.guildId,  {
        cascade: true,
    })
    @JoinColumn()
    reactions: GuildReactions;

    @Column()
    marketAlerts: boolean;

    @Column()
    marketAlertsChannel: string;

    @Column()
    marketAlertsPingRole: string;

    @Column()
    countHerMaxLobbies: number;

    @Column()
    countHerResultsChannel: string;

    @Column()
    countHerBaseCategory: string;

    @Column()
    xpTrack: boolean;

    @Column()
    xpTrackLimit: number;

    @OneToMany(() => GuildXpRecord, guildXpRecord => guildXpRecord.guildId,  {
        cascade: true,
    })
    xpRecords: GuildXpRecord[];

}