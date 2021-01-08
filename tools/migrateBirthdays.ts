import fs from 'fs';
import path from 'path';
import env from '../env.json';
import discord from 'discord.js';

let start = Date.now();
let str = `
    January 28th: Gabe
    February 11th: Alli
    February 20th: Legho
    March 1st: ali
    March 23rd: Sara, and Jack
    April 16th: Baasim
    April 20th: Matt S
    May 3rd: Sana
    May 6th: Spencer
    May 17th: Josue
    June 13th: Fleance
    June 21st: Andrew M
    July 12th: serene
    July 22nd: Eric
    August 1st: Anan
    August 6th: Conner
    August 26th: Mahad
    September 16th: Dan
    September 17th: David
    September 22nd: jay
    September 25th: sunny
    September 30th: Luke
    October 20th: fernanda
    October 28th: Benny, and alina
    November 5th: Andrew R
    November 10th: Mia
    November 11th: Jon
    November 23rd: mike
    November 28th: Gwen
    November 29th: Huubang
    December 13th: !!Alex M!!
    December 26th: ethan
    December 27th: Conor
    December 30th: Mitch
`;

type BirthdayPayload = {
    date: number;
    users: string[];
}

let dates = str
    .trim()
    .split('\n')
    .map(s => s.trim()
    .split(':')
    .map(s => s.trim()));

let result: BirthdayPayload[] = [];

dates.map(payload => {
    let d = `${payload[0]
        .replace('th', ' ')
        .replace('rd', ' ')
        .replace(/\d{1}st/, '1 ')
        .replace('nd', ' ') + new Date().getFullYear()}`;
    let date = new Date(d);
    let users = payload[1]
        .replace('and ', '')
        .split(', ');

    result.push({ date: date.getTime(), users })
});

let client = new discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.on('ready', async () => {
    let payload = {
        '749978305549041734': result
    }

    let guild = await client.guilds.fetch('749978305549041734');
    let members = await guild.members.fetch();
    let users = members.array();

    result.map(day => {
        let names = day.users;
        names.forEach((nick, i) => {
            let match = users.find(user => user.nickname === nick);
            if (!match) {
                return;
            }

            names[i] = match.id;
        });
    });

    fs.writeFileSync(path.join(__dirname, '../', 'birthdays.json'), JSON.stringify(payload, null, 3), {
        encoding: 'utf8',
        flag: 'w+'
    });

    let records = 0;
    result.forEach(record => records += record.users.length);
    
    // @ts-ignore
    console.log(`Finished migrating ${records} birthdays in ${parseFloat(Date.now() - start).toFixed(2)}ms.`)

    client.destroy();
    process.exit(0);
});

client.login(env.token);