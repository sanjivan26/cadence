import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/client";
import { getGames, type Game } from "../api/games";

function AdminPuzzles() {
    const navigate = useNavigate();

    const [games, setGames] = useState<Game[]>([]);
    const [gameSlug, setGameSlug] = useState("");
    const [puzzleDate, setPuzzleDate] = useState("");
    const [answer, setAnswer] = useState("");
    const [artist, setArtist] = useState("");
    const [year, setYear] = useState("");
    const [puzzleStatus, setPuzzleStatus] = useState("published");
    const [image, setImage] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [loadingGames, setLoadingGames] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadGames() {
            try {
                const data = await getGames();

                setGames(data);

                if (data.length > 0) {
                    setGameSlug(data[0].slug);
                }
            } catch {
                setError("Unable to load games.");
            } finally {
                setLoadingGames(false);
            }
        }

        loadGames();
    }, []);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!image) {
            setError("Please select an image.");
            return;
        }

        if (!gameSlug) {
            setError("Please select a game.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("game_slug", gameSlug);
            formData.append("puzzle_date", puzzleDate);
            formData.append("answer", answer);
            formData.append("artist", artist);
            formData.append("year", year);
            formData.append("puzzle_status", puzzleStatus);
            formData.append("image", image);

            await api.post("/admin/puzzles", formData);

            setMessage("Puzzle created successfully.");

            setAnswer("");
            setArtist("");
            setYear("");
            setImage(null);

            const fileInput = document.getElementById(
                "puzzle-image"
            ) as HTMLInputElement | null;

            if (fileInput) {
                fileInput.value = "";
            }
        } catch (err: any) {
            const detail =
                err?.response?.data?.detail;

            setError(
                detail || "Unable to create puzzle."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app admin-page">

            {/* Navbar */}

            <header className="navbar">

                <div className="navbar-left">

                    <button
                        className="menu-button"
                        aria-label="Go back"
                        onClick={() => navigate("/home")}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <div className="logo">
                        cadence
                    </div>

                </div>

                <div className="admin-nav-label">
                    Admin
                </div>

            </header>

            {/* Content */}

            <main className="admin-content">

                <section className="admin-header">

                    <p className="eyebrow">
                        ADMIN
                    </p>

                    <h1>
                        Add a puzzle
                    </h1>

                    <p>
                        Create the daily puzzle for your players.
                    </p>

                </section>

                <form
                    className="puzzle-form"
                    onSubmit={handleSubmit}
                >

                    {/* Game */}

                    <div className="form-group">

                        <label htmlFor="game">
                            Game
                        </label>

                        <select
                            id="game"
                            value={gameSlug}
                            onChange={(event) =>
                                setGameSlug(event.target.value)
                            }
                            disabled={loadingGames || loading}
                        >
                            {games.map((game) => (
                                <option
                                    key={game.slug}
                                    value={game.slug}
                                >
                                    {game.name}
                                </option>
                            ))}
                        </select>

                    </div>

                    {/* Date */}

                    <div className="form-group">

                        <label htmlFor="puzzle-date">
                            Puzzle date
                        </label>

                        <input
                            id="puzzle-date"
                            type="date"
                            value={puzzleDate}
                            onChange={(event) =>
                                setPuzzleDate(event.target.value)
                            }
                            required
                            disabled={loading}
                        />

                    </div>

                    {/* Answer */}

                    <div className="form-group">

                        <label htmlFor="answer">
                            Answer
                        </label>

                        <input
                            id="answer"
                            type="text"
                            placeholder="e.g. Abbey Road"
                            value={answer}
                            onChange={(event) =>
                                setAnswer(event.target.value)
                            }
                            required
                            disabled={loading}
                        />

                    </div>

                    {/* Artist */}

                    <div className="form-group">

                        <label htmlFor="artist">
                            Artist
                        </label>

                        <input
                            id="artist"
                            type="text"
                            placeholder="e.g. The Beatles"
                            value={artist}
                            onChange={(event) =>
                                setArtist(event.target.value)
                            }
                            required
                            disabled={loading}
                        />

                    </div>

                    {/* Year */}

                    <div className="form-group">

                        <label htmlFor="year">
                            Release year
                        </label>

                        <input
                            id="year"
                            type="number"
                            placeholder="1969"
                            min="1900"
                            max="2100"
                            value={year}
                            onChange={(event) =>
                                setYear(event.target.value)
                            }
                            required
                            disabled={loading}
                        />

                    </div>

                    {/* Status */}

                    <div className="form-group">

                        <label htmlFor="status">
                            Status
                        </label>

                        <select
                            id="status"
                            value={puzzleStatus}
                            onChange={(event) =>
                                setPuzzleStatus(event.target.value)
                            }
                            disabled={loading}
                        >
                            <option value="published">
                                Published
                            </option>

                            <option value="scheduled">
                                Scheduled
                            </option>

                            <option value="draft">
                                Draft
                            </option>
                        </select>

                    </div>

                    {/* Image */}

                    <div className="form-group">

                        <label htmlFor="puzzle-image">
                            Album image
                        </label>

                        <div className="file-input">

                            <input
                                id="puzzle-image"
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    setImage(
                                        event.target.files?.[0] || null
                                    )
                                }
                                required
                                disabled={loading}
                            />

                            {image && (
                                <span className="selected-file">
                                    {image.name}
                                </span>
                            )}

                        </div>

                        <span className="form-help">
                            The image will automatically be processed
                            into the puzzle levels.
                        </span>

                    </div>

                    {/* Feedback */}

                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="form-success">
                            {message}
                        </div>
                    )}

                    {/* Submit */}

                    <button
                        type="submit"
                        className="admin-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating puzzle..."
                            : "Add puzzle"}
                    </button>

                </form>

            </main>

        </div>
    );
}

export default AdminPuzzles;