export type StonkboardRepository = {
    records: StonkboardRecord[];
    users: StonkboardUser[];
}

export type StonkboardRecord = {
    message: {
        id: string;
        author: string;
        creation: string;
    }
    time: string;
}

export type StonkboardUser = {
    id: string;
    exp: number;
    level: number;
}