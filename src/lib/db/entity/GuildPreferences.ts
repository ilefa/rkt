import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class GuildPreferences {

    @PrimaryGeneratedColumn()
    sid: number;

    @Column()
    guildId: string;

    @Column()
    prefix: string;

    @Column()
    debug: boolean;

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

}