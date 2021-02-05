import { spawn } from 'child_process';

const HASH_PATTERN = /\b[0-9a-f]{5,40}\b/;
const exec = (args): Promise<string> => new Promise((res, rej) => {
    const srv = spawn('git', args.split(' '));
    const out = {
        stdout: [],
        stderr: []
    }

    srv.stdout.on('data', data => out.stdout.push(data.toString()));
    srv.stderr.on('data', data => out.stderr.push(data.toString()));
    srv.on('exit', code => {
        if (code !== 0) {
            return rej(out.stderr.join('').trim());
        }

        res(out.stdout.join('').trim());
    })
});

export const getCurrentVersion = async () => {
    let res = await exec('rev-parse HEAD');
    if (!HASH_PATTERN.test(res)) {
        return 'unknown';
    }

    return res.substring(0, 7);
};

export const getUpstreamVersion = async () => {
    let res = await exec(`ls-remote git@github.com:ilefa/stonksbot.git | grep refs/heads/${await getReleaseChannel()} | cut -f 1`);
    if (!res) {
        return 'unknown';   
    }

    return res.substr(0, 7);
}

export const getReleaseChannel = async () => {
    let res = await exec('rev-parse --abbrev-ref HEAD');
    if (res.startsWith('fatal')) {
        return 'unknown';
    }

    return res;
};

export const update = async (then?: (version: String) => void) => {
    let local = await getCurrentVersion();
    let remote = await getUpstreamVersion();
    if (local.toLowerCase() === remote.toLowerCase()) {
        return then(local);
    }

    let res = await exec('git pull');
    if (!res) {
        return then('Failure');
    }

    return then(await getCurrentVersion());
}