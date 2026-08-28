import axios from "axios";

export interface Game {
    slug: string;
    name: string;
    description: string | null;
}

const API_URL = import.meta.env.VITE_API_URL;

export async function getGames(): Promise<Game[]> {
    const token = localStorage.getItem("access_token");

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