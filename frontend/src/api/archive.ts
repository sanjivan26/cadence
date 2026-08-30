import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface ArchivePuzzle {
    puzzle_id: number;
    puzzle_number: number;
    date: string;
    completed: boolean;
    solved: boolean;
    attempts: number;
    score: number;
    image_url: string;
}

export interface ArchiveGame {
    slug: string;
    name: string;
    puzzles: ArchivePuzzle[];
}

export async function getArchive(): Promise<ArchiveGame[]> {
    const token = localStorage.getItem("access_token");

    const response = await axios.get<ArchiveGame[]>(
        `${API_URL}/games/archive`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}