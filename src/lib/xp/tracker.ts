import fs from 'fs';
import path from 'path';
import moment from 'moment';
import scheduler from 'node-schedule';
import env from '../../../env.json';

import * as Logger from '../logger';

import { getLeaderboard } from './api';
import { timeDiff } from '../util';
import { 
    TrackingType,
    XpBoardUser,
    XpMoverVariance,
    XpPayload,
    XpRecord
} from './struct';

let file = path.join(__dirname, '../../../', 'xprepo.json');

export default class XpTracker {

    init() {
        let start = Date.now();
        scheduler.scheduleJob(env.xpTrackInterval, async () => {
            if (!env.xpTrack) {
                return;
            }
            
            let guild = env.xpTrackServer;
            let res = await getLeaderboard(guild);
            if (!res) {
                return Logger.severe('Exp Tracker', `Failed to record datapoints for ${guild} at ${moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a')}.`);
            }

            this.recordPoints(res);
        });

        Logger.info('Exp Tracker', `Retrieval Schedule: [${env.xpTrackInterval}]`)
        Logger.info('Exp Tracker', `Enabled in ${timeDiff(start)}ms.`);
    }

    /**
     * Attempts to generate records in the flat-file
     * experience repository for the given snapshot.
     * 
     * @param points the leaderboard positions to process
     */
    recordPoints(points: XpBoardUser[]): { data: XpPayload, repo: XpPayload[] } {
        try {
            let data = this.toData(points, env.xpTrackLimit);
            let repo = JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }));
            if (!repo) {
                fs.writeFileSync(file, JSON.stringify(data, null, 3), { encoding: 'utf8' });
                return;
            }
    
            repo.push(data);
            fs.writeFileSync(file, JSON.stringify(repo, null, 3), { encoding: 'utf8', flag: 'w' });

            return {
                data, repo
            };
        } catch (e) {
            Logger.except(e, 'Exp Tracker', 'Failed to write to the flat-file datastore');
            console.trace(e);
            return null;
        }
    }

    /**
     * Generates an XpPayload compatible object containing
     * all leaderboard positions for the provided snapshot.
     * 
     * @param points the leaderboard positions to process
     */
    toData(points: XpBoardUser[], limit?: number): XpPayload {
        let payload = {
            time: Date.now(),
            data: []
        };

        if (limit) {
            points = points.slice(0, limit >= points.length 
                ? points.length
                : limit);
        }

        points.map((point, i) => payload.data.push({
            client: {
                id: point.id,
                name: point.username,
                discriminator: point.discriminator
            },
            time: Date.now(),
            level: point.level,
            position: i + 1,
            messages: point.message_count,
            experience: point.xp
        }));

        return payload;
    }

}

export const collectEntries = (target: string, range: number): XpRecord[] => {
    try {
        let data = fs.readFileSync(file, { encoding: 'utf8' });
        if (!data) {
            return null;
        }
    
        let repo = JSON.parse(data) as XpPayload[];
        repo = repo.filter(payload => (Date.now() - payload.time) <= range);
        
        let entries = [];
        for (let { data } of repo) {
            let ent = data.filter(ent => ent.client.id === target);
            entries.push(ent);
        }

        return entries;
    } catch (e) {
        Logger.except(e, 'Exp Tracker', `Failed to collect historical data for ${target}`);
        return null;
    }
}

export const getRecordVariance = (initial: XpRecord, latest: XpRecord): XpMoverVariance => {
    return {
        client: initial.client.id,
        marker: latest.time,
        period: latest.time - initial.time,
        exp: latest.experience - initial.experience,
        level: latest.level - initial.level,
        messages: latest.messages - initial.messages,
        position: latest.position - initial.position
    }
}

export const ascendingDateComparator = (a: XpRecord, b: XpRecord) => new Date(b.time).getTime() - new Date(a.time).getTime();
export const descendingDateComparator = (a: XpRecord, b: XpRecord) => new Date(a.time).getTime() - new Date(b.time).getTime();

export const getTopMovers = async (guild: string, limit: number, range: number = 86400000) => {
    let board: XpBoardUser[] = await getLeaderboard(guild);
    if (!board) {
        return null;
    }

    board = board.slice(0, Math.min(limit, board.length));

    let entries: XpMoverVariance[] = [];
    for (let { id } of board) {
        let data = collectEntries(id, range).sort(ascendingDateComparator);
        if (!data) {
            continue;
        }

        let initial = data[0][0];
        if (!initial) {
            continue;
        }

        let latest = data[data.length - 1][0];
        if (!latest) {
            continue;
        }

        let variance = getRecordVariance(initial, latest);
        entries.push(variance);
    }

    entries = entries.sort((a, b) => {
        // eventually make this factor in positions gained/lost aswell
        return b.messages === a.messages 
            ? b.exp - a.exp 
            : b.messages - a.messages;
    });

    return entries;
}

export const getNameForType = (type: TrackingType) => {
    switch (type) {
        case 'xp':
            return 'experience';
        case 'messages':
            return 'message';
        case 'position':
            return 'position';
    }
}