import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getArchive,
    type ArchiveGame,
} from "../api/archive";

import ArchiveRow from "../components/ArchiveRow";
import Sidebar from "../components/Sidebar";
import LoadingScreen from "../components/LoadingScreen";

import { getCurrentUser, type User } from "../api/auth";
import { getGames, type Game } from "../api/games";

function Archive() {
    const navigate = useNavigate();

    const [archive, setArchive] = useState<ArchiveGame[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [games, setGames] = useState<Game[]>([]);
    const [menuOpen, setMenuOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadArchive() {
            try {
                const [archiveData, userData, gamesData] =
                    await Promise.all([
                        getArchive(),
                        getCurrentUser(),
                        getGames(),
                    ]);

                console.log("ARCHIVE:", archiveData);
                console.log("USER:", userData);
                console.log("GAMES:", gamesData);

                setArchive(archiveData);
                setUser(userData);
                setGames(gamesData);

            } catch (err: any) {
                console.error("ARCHIVE LOAD ERROR:", err);

                setError(
                    err?.response?.data?.detail ||
                    err?.message ||
                    "Unable to load the archive."
                );
            } finally {
                setLoading(false);
            }
        }

        loadArchive();
    }, []);

    // ---------------------------------------------------------
    // LOADING
    // ---------------------------------------------------------

    if (loading) {
        return (
            <LoadingScreen message="Loading archive..." />
        );
    }

    // ---------------------------------------------------------
    // ERROR
    // ---------------------------------------------------------

    if (error) {
        return (
            <div className="app">
                <header className="navbar">
                    <div className="navbar-left">
                        <button
                            className="menu-button"
                            aria-label="Open menu"
                            onClick={() => setMenuOpen(true)}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>

                        <button
                            className="logo"
                            onClick={() => navigate("/home")}
                        >
                            cadence
                        </button>
                    </div>
                </header>

                <main className="archive-content">
                    <div className="archive-error">
                        <p className="eyebrow">ARCHIVE</p>

                        <h1>
                            Something went wrong
                        </h1>

                        <p>
                            {error}
                        </p>

                        <button
                            className="play-button"
                            onClick={() => navigate("/home")}
                        >
                            Back to Home
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // ---------------------------------------------------------
    // PAGE
    // ---------------------------------------------------------

    return (
        <div className="app">

            {/* NAVBAR */}

            <header className="navbar">

                <div className="navbar-left">

                    <button
                        className="menu-button"
                        aria-label="Open menu"
                        onClick={() => setMenuOpen(true)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <button
                        className="logo"
                        onClick={() => navigate("/home")}
                    >
                        cadence
                    </button>

                </div>

                <div className="navbar-right">

                    {user && (
                        <button
                            className="profile-button"
                            onClick={() => setMenuOpen(true)}
                        >
                            <span className="profile-avatar">
                                {user.username
                                    .charAt(0)
                                    .toUpperCase()}
                            </span>

                            <span className="profile-name">
                                {user.username}
                            </span>
                        </button>
                    )}

                </div>

            </header>


            {/* SIDEBAR */}

            {menuOpen && user && (
                <Sidebar
                    games={games}
                    user={user}
                    onClose={() => setMenuOpen(false)}
                />
            )}


            {/* =========================================================
    CONTENT
    ========================================================= */}

            <main className="archive-content">

                <div className="archive-container">

                    {/* =================================================
            ARCHIVE HEADER
            ================================================= */}

                    <section className="archive-header">

                        <p className="eyebrow">
                            CADENCE
                        </p>

                        <h1>
                            Archive
                        </h1>

                        <p className="subtitle">
                            Revisit puzzles you've played.
                        </p>

                    </section>


                    {/* =================================================
            GAME ARCHIVES
            ================================================= */}

                    <section className="archive-games">

                        {archive.length === 0 ? (

                            <div className="archive-empty">

                                <h2>
                                    No puzzles yet
                                </h2>

                                <p>
                                    Complete a daily puzzle and it
                                    will appear here.
                                </p>

                            </div>

                        ) : (

                            archive.map((game) => (

                                <ArchiveRow
                                    key={game.slug}
                                    game={game}
                                    onViewAll={() => {
                                        // Full archive can be added later.
                                    }}
                                    onPuzzleClick={(puzzleId) => {
                                        console.log(
                                            "Open archived puzzle:",
                                            puzzleId
                                        );
                                    }}
                                />

                            ))

                        )}

                    </section>

                </div>

            </main>
        </div>
    );
}

export default Archive;