import axios from "axios";

export interface HistoryItem {
    puzzle_id: number;
    game: string;
    date: string;
    attempts: number;
    solved: boolean;
}

export async function getHistory(): Promise<HistoryItem[]> {
    const token = localStorage.getItem("access_token");

    const response = await axios.get<HistoryItem[]>(
        "http://127.0.0.1:8000/games/history",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}