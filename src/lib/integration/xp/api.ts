import axios from 'axios';
import { XpBoardUser } from "./struct";

export const getLeaderboard = async (guild: string): Promise<XpBoardUser[]> => await axios
    .get(`https://mee6.xyz/api/plugins/levels/leaderboard/${guild}`)
    .then(res => res.data)
    .then(data => data.players)
    .catch(() => null);