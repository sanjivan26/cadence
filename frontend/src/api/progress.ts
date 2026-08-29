import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface GameProgress {
    slug: string;
    completed: boolean;
    solved: boolean;
    attempts: number;
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
        `${API_URL}/games/progress`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}