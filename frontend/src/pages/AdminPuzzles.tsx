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

    // ---------------------------------------------------------
    // LOAD GAMES
    // ---------------------------------------------------------

    useEffect(() => {
        async function loadGames() {
            try {
                const data = await getGames();

                setGames(data);

                if (data.length > 0) {
                    setGameSlug(data[0].slug);
                }
            } catch (err) {
                console.error("Failed to load games:", err);
                setError("Unable to load games.");
            } finally {
                setLoadingGames(false);
            }
        }

        loadGames();
    }, []);

    // ---------------------------------------------------------
    // SUBMIT PUZZLE
    // ---------------------------------------------------------

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setMessage("");
        setError("");

        // Validate image
        if (!image) {
            setError("Please select an image.");
            return;
        }

        // Validate game
        if (!gameSlug) {
            setError("Please select a game.");
            return;
        }

        // Validate date
        if (!puzzleDate) {
            setError("Please select a puzzle date.");
            return;
        }

        // Validate answer
        if (!answer.trim()) {
            setError("Please enter an answer.");
            return;
        }

        // Validate artist
        if (!artist.trim()) {
            setError("Please enter the artist.");
            return;
        }

        // Validate year
        if (!year) {
            setError("Please enter the release year.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("game_slug", gameSlug);
            formData.append("puzzle_date", puzzleDate);
            formData.append("answer", answer.trim());
            formData.append("artist", artist.trim());
            formData.append("year", year);
            formData.append("puzzle_status", puzzleStatus);
            formData.append("image", image);

            // IMPORTANT:
            // This endpoint expects multipart/form-data.
            //
            // Do NOT manually add a boundary.
            // Axios/browser will generate it automatically.
            const response = await api.post(
                "/admin/puzzles",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("Puzzle created:", response.data);

            setMessage("Puzzle created successfully.");

            // Reset form
            setPuzzleDate("");
            setAnswer("");
            setArtist("");
            setYear("");
            setPuzzleStatus("published");
            setImage(null);

            const fileInput = document.getElementById(
                "puzzle-image"
            ) as HTMLInputElement | null;

            if (fileInput) {
                fileInput.value = "";
            }

        } catch (err: any) {
            console.error("Puzzle creation failed:", err);

            const status = err?.response?.status;
            const detail = err?.response?.data?.detail;

            if (status === 409) {
                setError(
                    detail ||
                    "A puzzle already exists for this game and date."
                );
            } else if (status === 403) {
                setError(
                    detail ||
                    "You do not have administrator access."
                );
            } else if (status === 404) {
                setError(
                    detail ||
                    "The selected game could not be found."
                );
            } else if (status === 422) {
                setError(
                    detail ||
                    "Some puzzle fields are invalid or missing."
                );
            } else if (status === 400) {
                setError(
                    detail ||
                    "The uploaded image could not be processed."
                );
            } else {
                setError(
                    detail ||
                    "Unable to create puzzle."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    // ---------------------------------------------------------
    // UI
    // ---------------------------------------------------------

    return (
        <div className="app admin-page">

            {/* =================================================
                NAVBAR
               ================================================= */}

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


            {/* =================================================
                CONTENT
               ================================================= */}

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


                {/* =================================================
                    FORM
                   ================================================= */}

                <form
                    className="puzzle-form"
                    onSubmit={handleSubmit}
                >

                    {/* -------------------------
                        GAME
                       ------------------------- */}

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
                            disabled={
                                loadingGames ||
                                loading
                            }
                            required
                        >
                            {games.length === 0 && (
                                <option value="">
                                    {loadingGames
                                        ? "Loading games..."
                                        : "No games available"}
                                </option>
                            )}

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


                    {/* -------------------------
                        DATE
                       ------------------------- */}

                    <div className="form-group">

                        <label htmlFor="puzzle-date">
                            Puzzle date
                        </label>

                        <input
                            id="puzzle-date"
                            type="date"
                            value={puzzleDate}
                            onChange={(event) =>
                                setPuzzleDate(
                                    event.target.value
                                )
                            }
                            required
                            disabled={loading}
                        />

                    </div>


                    {/* -------------------------
                        ANSWER
                       ------------------------- */}

                    <div className="form-group">

                        <label htmlFor="answer">
                            Answer
                        </label>

                        <input
                            id="answer"
                            type="text"
                            placeholder="e.g. In Rainbows"
                            value={answer}
                            onChange={(event) =>
                                setAnswer(
                                    event.target.value
                                )
                            }
                            required
                            disabled={loading}
                        />

                    </div>


                    {/* -------------------------
                        ARTIST
                       ------------------------- */}

                    <div className="form-group">

                        <label htmlFor="artist">
                            Artist
                        </label>

                        <input
                            id="artist"
                            type="text"
                            placeholder="e.g. Radiohead"
                            value={artist}
                            onChange={(event) =>
                                setArtist(
                                    event.target.value
                                )
                            }
                            required
                            disabled={loading}
                        />

                    </div>


                    {/* -------------------------
                        YEAR
                       ------------------------- */}

                    <div className="form-group">

                        <label htmlFor="year">
                            Release year
                        </label>

                        <input
                            id="year"
                            type="number"
                            placeholder="2007"
                            min="1900"
                            max="2100"
                            value={year}
                            onChange={(event) =>
                                setYear(
                                    event.target.value
                                )
                            }
                            required
                            disabled={loading}
                        />

                    </div>


                    {/* -------------------------
                        STATUS
                       ------------------------- */}

                    <div className="form-group">

                        <label htmlFor="status">
                            Status
                        </label>

                        <select
                            id="status"
                            value={puzzleStatus}
                            onChange={(event) =>
                                setPuzzleStatus(
                                    event.target.value
                                )
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


                    {/* -------------------------
                        IMAGE
                       ------------------------- */}

                    <div className="form-group">

                        <label htmlFor="puzzle-image">
                            Album image
                        </label>

                        <div className="file-input">

                            <input
                                id="puzzle-image"
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                    const selectedFile =
                                        event.target.files?.[0] ||
                                        null;

                                    setImage(selectedFile);
                                }}
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
                            The image will automatically be
                            processed into the puzzle levels.
                        </span>

                    </div>


                    {/* -------------------------
                        ERROR
                       ------------------------- */}

                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}


                    {/* -------------------------
                        SUCCESS
                       ------------------------- */}

                    {message && (
                        <div className="form-success">
                            {message}
                        </div>
                    )}


                    {/* -------------------------
                        SUBMIT
                       ------------------------- */}

                    <button
                        type="submit"
                        className="admin-submit"
                        disabled={
                            loading ||
                            loadingGames ||
                            games.length === 0
                        }
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