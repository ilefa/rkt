import fs from 'fs';
import path from 'path';
import moment from 'moment';
import scheduler from 'node-schedule';
import env from '../../../../env.json';

import { getLeaderboard } from './api';
import { TrackingType, XpBoardUser, XpPayload, XpRecord } from './struct';

let file = path.join(__dirname, '../../../../', 'xprepo.json');

export default class XpTracker {

    init() {
        scheduler.scheduleJob(env.xpTrackInterval, async () => {
            if (!env.xpTrack) {
                return;
            }
            
            let guild = env.xpTrackServer;
            let res = await getLeaderboard(guild);
            if (!res) {
                return console.error(`Failed to record datapoints for ${guild} at ${moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a')}.`);
            }

            this.recordPoints(res);
        });
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
            console.error('Failed to write to the flat-file datastore.');
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
        return null;
    }
}

export const getTopMovers = (limit: number) => {
    
}

export const getNameForType = (type: TrackingType) => {
    switch (type) {
        case 'xp':
            return 'experience';
        case 'messages':
            return 'messages';
        case 'position':
            return 'position';
    }
}