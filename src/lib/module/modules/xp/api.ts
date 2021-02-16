import axios from 'axios';

import { XpBoardUser } from './struct';

/**
 * Attempts to retrieve mee6 leaderboard information
 * pertaining to a guild's experience dataset.
 * @param guild the guild id to lookup
 */
export const getLeaderboard = async (guild: string, limit: number = 200): Promise<XpBoardUser[]> => await axios
    .get(`https://mee6.xyz/api/plugins/levels/leaderboard/${guild}?limit=${limit}`)
    .then(res => res.data)
    .then(data => data.players)
    .catch(() => null);