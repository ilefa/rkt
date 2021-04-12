import env from '../env.json';
import discord from 'discord.js';

import { sleep } from '../src/lib/util';

let client = new discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    fetchAllMembers: true
});

let filtered = [
    '779480670316920862',
    '770340165876973569',
    '767951021531594822',
    '767950997578186752',
    '767950910096932934',
    '770351929091162182',
    '770340181144109066',
    '786289918182686750',
    '770340394717675570',
    '777262434947170345',
    '770358214487179324',
    '770357982956617728',
    '777262688736772117',
    '777261226521526273',
    '770716732896575568',
    '778749446137315351',
    '798638121884450837',
    '778446409766273034',
    '777261755067007007',
    '770358095293317180',
    '788117921774960680',
    '770717116633448449',
    '785992367361490986',
    '799789132380373012',
    '799435106816098304'
];

client.on('ready', async () => {
    let guild = await client.guilds.fetch('749978305549041734');
    let roles = guild.roles.cache.array();
    let total = guild.memberCount;

    console.log('Natural sleep. (2.5s)')
    await sleep(2500);
    
    console.log('[ name ] ( percent bar ) [ # members | % of server ]');
    console.log('-'.repeat(52));

    roles
        .sort((a, b) => b.members.size - a.members.size)
        .filter(role => filtered.includes(role.id))
        .forEach(async (role, i) => {
            let members = role.members;
            let o = Math.floor((members.size / total) * 10);
            let percent = ((members.size / total) * 100).toFixed(2);
            console.log(`${i + 1}. [${role.name}] (${'▰'.repeat(o)}${'▱'.repeat(10 - o)}) [${members.size} | ${percent}%]`);
        });

    client.destroy();
    process.exit(0);
});

client.login(env.token);