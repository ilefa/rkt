import env from '../env.json';
import discord from 'discord.js';

import { join } from '@ilefa/ivy';

let client = new discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.on('ready', async () => {
    let guild = await client.guilds.fetch('749978305549041734');
    let roles = guild.roles.cache.array();
    
    // @ts-ignore
    console.log(join(roles, '\n', role => `${role.name} (${role.id})`));

    client.destroy();
    process.exit(0);
});

client.login(env.token);