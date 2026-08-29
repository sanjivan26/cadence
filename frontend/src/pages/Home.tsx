import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, type User } from "../api/auth";
import { getProgress, type Progress } from "../api/progress";
import {
  getHistory,
  type HistoryItem,
} from "../api/history";
import { getGames, type Game } from "../api/games";
import Sidebar from "../components/Sidebar";
import LoadingScreen from "../components/LoadingScreen";
import { gameIcons } from "../components/GameIcons";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // LOAD HOME DATA
  // ---------------------------------------------------------

  useEffect(() => {
    async function loadHome() {
      try {
        const [
          userData,
          progressData,
          historyData,
          gamesData,
        ] = await Promise.all([
          getCurrentUser(),
          getProgress(),
          getHistory(),
          getGames(),
        ]);

        setUser(userData);
        setProgress(progressData);
        setHistory(historyData);
        setGames(gamesData);

      } catch (err) {
        console.error(err);
        setError("Unable to load your account.");
      }
    }

    loadHome();
  }, []);

  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

  if (error) {
    return <p>{error}</p>;
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (!user || !progress) {
    return (
      <LoadingScreen message="Loading..." />
    );
  }

  // ---------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
          ===================================================== */}

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

          <div className="logo">
            cadence
          </div>

        </div>

        <div className="navbar-right">

          <div className="streak">

            <span className="streak-icon">
              🔥
            </span>

            <span>
              {progress.current_streak}
            </span>

          </div>

          <div className="navbar-divider"></div>

          <button
            className="profile-button"
            onClick={() => setMenuOpen(true)}
          >

            <span className="profile-avatar">
              {user.username.charAt(0).toUpperCase()}
            </span>

            <span className="profile-name">
              {user.username}
            </span>

          </button>

        </div>

      </header>

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      {menuOpen && (
        <Sidebar
          games={games}
          user={user}
          onClose={() => setMenuOpen(false)}
        />
      )}

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="home-content">

        <section className="welcome-section">

          {/* =================================================
              WELCOME
              ================================================= */}

          <p className="eyebrow">
            WELCOME BACK
          </p>

          <h1>
            {user.username}
          </h1>

          <p className="subtitle">
            Keep your streak going.
          </p>

          {/* =================================================
              PROGRESS
              ================================================= */}

          <div className="progress-grid">

            <div className="progress-card">

              <span className="progress-label">
                CURRENT STREAK
              </span>

              <strong className="progress-value">
                {progress.current_streak}
              </strong>

              <span className="progress-unit">
                days
              </span>

            </div>

            <div className="progress-card">

              <span className="progress-label">
                BEST STREAK
              </span>

              <strong className="progress-value">
                {progress.best_streak}
              </strong>

              <span className="progress-unit">
                days
              </span>

            </div>

            <div className="progress-card">

              <span className="progress-label">
                COMPLETED
              </span>

              <strong className="progress-value">
                {progress.completed}
              </strong>

              <span className="progress-unit">
                puzzles
              </span>

            </div>

          </div>

          {/* =================================================
              TODAY'S GAMES
              ================================================= */}

          <div className="dailies-section">

            <p className="eyebrow">
              TODAY'S GAMES
            </p>

            <div className="daily-grid">

              {games.map((game) => {

                /*
                 * IMPORTANT:
                 *
                 * Today's game state comes from progress.games.
                 *
                 * Do NOT use history here because history can
                 * contain older puzzles for the same game.
                 */

                const gameProgress =
                  progress.games.find(
                    (item) =>
                      item.slug === game.slug
                  );

                const completed =
                  gameProgress?.completed ?? false;

                const solved =
                  gameProgress?.solved ?? false;

                const attempts =
                  gameProgress?.attempts ?? 0;

                return (
                  <div
                    className="daily-card"
                    key={game.slug}
                  >

                    {/* =================================================
                        HEADER
                        ================================================= */}

                    <div className="daily-card-header">

                      <h2>
                        {game.name}
                      </h2>

                      <span
                        className={`daily-card-status ${completed
                            ? "status-done"
                            : "status-live"
                          }`}
                      >
                        {completed
                          ? "DONE"
                          : "LIVE"}
                      </span>

                    </div>

                    {/* =================================================
                        CONTENT
                        ================================================= */}

                    <div className="landing-album">

                      <div className="landing-album-art">
                        {gameIcons[game.slug] ?? "♪"}
                      </div>

                      <div className="landing-album-info">

                        <p className="landing-album-type">
                          DAILY PUZZLE
                        </p>

                        <h3>
                          {game.name}
                        </h3>

                        <p>
                          {game.description}
                        </p>

                      </div>

                    </div>

                    {/* =================================================
                        FOOTER
                        ================================================= */}

                    <div className="daily-card-footer">

                      <span className="daily-card-result">

                        {!completed
                          ? "New puzzle every day"
                          : solved
                            ? `Solved in ${attempts} ${attempts === 1
                              ? "try"
                              : "tries"
                            }`
                            : "Better luck next time"}

                      </span>

                      <button
                        className="daily-card-button"
                        onClick={() => {

                          if (!completed) {
                            navigate(
                              `/games/${game.slug}/daily`
                            );
                          }

                        }}
                      >

                        {!completed
                          ? "Play"
                          : solved
                            ? "Solved ✓"
                            : "Played"}

                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

          {/* =================================================
              RECENT PUZZLES
              ================================================= */}

          <div className="history-section">

            <p className="eyebrow">
              RECENT PUZZLES
            </p>

            {history.length === 0 ? (

              <div className="history-empty">

                <p>
                  No completed puzzles yet.
                </p>

                <span>
                  Complete today's puzzle to start
                  your history.
                </span>

              </div>

            ) : (

              <div className="history-list">

                {history.map((item) => (

                  <div
                    className="history-card"
                    key={item.puzzle_id}
                  >

                    <div className="history-info">

                      <strong>
                        {item.game}
                      </strong>

                      <span>
                        {new Date(
                          item.date
                        ).toLocaleDateString(
                          undefined,
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>

                    </div>

                    <div className="history-result">

                      <strong>
                        {item.attempts}{" "}
                        {item.attempts === 1
                          ? "attempt"
                          : "attempts"}
                      </strong>

                      <span>
                        {item.solved
                          ? "Solved"
                          : "Failed"}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default Home;