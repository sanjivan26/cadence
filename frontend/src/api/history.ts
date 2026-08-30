import axios from "axios";

export interface HistoryItem {
    puzzle_id: number;
    game: string;
    date: string;
    attempts: number;
    solved: boolean;
    puzzle_number: number | null;
}

const API_URL = import.meta.env.VITE_API_URL;

export async function getHistory(): Promise<HistoryItem[]> {
    const token = localStorage.getItem("access_token");

    const response = await axios.get<HistoryItem[]>(
        `${API_URL}/games/history`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}