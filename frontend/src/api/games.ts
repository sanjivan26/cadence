import axios from "axios";

export interface Game {
    slug: string;
    name: string;
    description: string | null;
}

export async function getGames(): Promise<Game[]> {
    const token = localStorage.getItem("access_token");

    const response = await axios.get<Game[]>(
        "http://127.0.0.1:8000/games/",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}