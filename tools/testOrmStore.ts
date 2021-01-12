import 'reflect-metadata';

import { createConnection, DeepPartial } from 'typeorm';
import { Guild } from '../src/lib/db/entity/guild/Guild';

createConnection().then(async connection => {

    const gR = connection.getRepository(Guild);

    let guildId = '749978305549041734';
    let partial: DeepPartial<Guild> = {
        guildId,
        prefs: {
            guildId,
            prefix: '.',
            debug: true,
            marketAlerts: true,
            marketAlertsChannel: '784181852910256169',
            marketAlertsPingRole: '786736076852035595',
            countHerMaxLobbies: 1,
            countHerBaseCategory: '795861215607390208',
            countHerResultsChannel: '793704756002291713',
            xpTrack: true,
            xpTrackLimit: 15,
            xpRecords: [
                {
                    time: String(Date.now()),
                    record: [
                        {
                            'client': {
                                'id': '592924575831031821',
                                'name': 'jackjack',
                                'discriminator': '0323'
                            },
                            'time': '1609293720324',
                            'level': 32,
                            'position': 1,
                            'messages': 4063,
                            'experience': 81258
                        },
                        {
                            'client': {
                                'id': '224566699448336384',
                                'name': 'bruhad',
                                'discriminator': '4313'
                            },
                            'time': '1609293720324',
                            'level': 31,
                            'position': 2,
                            'messages': 3829,
                            'experience': 76201
                        },
                        {
                            'client': {
                                'id': '177167251986841600',
                                'name': 'MiKe',
                                'discriminator': '0001'
                            },
                            'time': '1609293720324',
                            'level': 26,
                            'position': 3,
                            'messages': 2389,
                            'experience': 47751
                        },
                        {
                            'client': {
                                'id': '140925622410149888',
                                'name': 'BadBeauWolfy',
                                'discriminator': '2051'
                            },
                            'time': '1609293720324',
                            'level': 23,
                            'position': 4,
                            'messages': 1851,
                            'experience': 36800
                        }
                    ]
                }
            ]
        },
        joinedTime: Date.now()
    };

    let testGuild = gR.create(partial);

    await gR.save(testGuild);

    const gld = await (await gR.findOne({ guildId: '749978305549041734'}, { relations: ["prefs", "prefs.xpRecords"] }));
    console.log(gld.prefs.xpRecords[0].record[0]);
    // console.log('Inserting a new user into the database...');
    // const user = new User();
    // user.firstName = 'Timber';
    // user.lastName = 'Saw';
    // user.age = 25;
    // await connection.manager.save(user);
    // console.log('Saved a new user with id: ' + user.id);

    // console.log('Loading users from the database...');
    // const users = await connection.manager.find(User);
    // console.log('Loaded users: ', users);

    // console.log('Here you can setup and run express/koa/any other framework.');

    

}).catch(error => console.log(error));
