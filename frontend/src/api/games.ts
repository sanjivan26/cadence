import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;


// ============================================================
// GAME
// ============================================================

export interface Game {
    slug: string;
    name: string;
    description: string | null;
}


// ============================================================
// PROGRESS
// ============================================================

export interface GameProgress {
    slug: string;
    completed: boolean;
    solved: boolean;
    attempts: number;
}

export interface UserProgress {
    current_streak: number;
    best_streak: number;
    completed: number;
    games: GameProgress[];
}


// ============================================================
// GET GAMES
// ============================================================

export async function getGames(): Promise<Game[]> {
    const token =
        localStorage.getItem("access_token");

    const response = await axios.get<Game[]>(
        `${API_URL}/games/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}


// ============================================================
// GET USER PROGRESS
// ============================================================

export async function getProgress(): Promise<UserProgress> {
    const token =
        localStorage.getItem("access_token");

    const response =
        await axios.get<UserProgress>(
            `${API_URL}/games/progress`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

    return response.data;
}