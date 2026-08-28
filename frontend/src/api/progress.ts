import axios from "axios";

export interface GameProgress {
    slug: string;
    completed: boolean;
}

export interface Progress {
    current_streak: number;
    best_streak: number;
    completed: number;
    games: GameProgress[];
}

export async function getProgress(): Promise<Progress> {
    const token = localStorage.getItem("access_token");

    const response = await axios.get<Progress>(
        "http://127.0.0.1:8000/games/progress",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}