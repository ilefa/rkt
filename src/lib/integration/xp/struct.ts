export type XpBoardUser = {
    avatar: string;
    detailed_xp: number[];
    discriminator: string;
    guild_id: string;
    id: string;
    level: number;
    message_count: number;
    username: string;
    xp: number;
}

export type XpRecord = {
    client: {
        id: string;
        name: string;
        discriminator: string;
    },
    time: number;
    level: number;
    position: number;
    messages: number;
    experience: number;
}

export type XpPayload = {
    time: number;
    data: XpRecord[];
}

export type GraphPayload = {
    x: number;
    y: number;
}

export type TrackingType = 'xp' | 'messages' | 'position';