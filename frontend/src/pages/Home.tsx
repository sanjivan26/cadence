import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, type User } from "../api/auth";
import { getProgress, type Progress } from "../api/progress";
import {
  getHistory,
  type HistoryItem,
} from "../api/history";
import { getGames, type Game } from "../api/games";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  const [error, setError] = useState("");



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
      } catch {
        setError("Unable to load your account.");
      }
    }

    loadHome();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!user || !progress) {
    return <p>Loading...</p>;
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          cadence
        </div>

        <nav>
          <button
            className="nav-button"
            onClick={() => navigate("/")}
          >
            Home
          </button>
        </nav>
      </header>

      <main className="main-content">
        <section className="hero">

          <p className="eyebrow">
            WELCOME BACK
          </p>

          <h1>
            {user.username}
          </h1>

          <p className="subtitle">
            Keep your streak going.
          </p>

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

          <div className="games-section">
            <p className="eyebrow">
              TODAY'S GAMES
            </p>

            <div className="games-list">
              {games.map((game) => {
                const gameProgress = progress.games.find(
                  (item) => item.slug === game.slug
                );

                const completed = gameProgress?.completed ?? false;

                return (
                  <div
                    className="today-card"
                    key={game.slug}
                  >
                    <div>
                      <h2>{game.name}</h2>

                      <p>
                        {game.description}
                      </p>
                    </div>

                    <button
                      className="play-button"
                      onClick={() => {
                        if (!completed) {
                          navigate(
                            `/games/${game.slug}/daily`
                          );
                        }
                      }}
                      disabled={completed}
                    >
                      {completed
                        ? "Completed ✓"
                        : "Play →"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="history-section">
            <p className="eyebrow">RECENT PUZZLES</p>

            {history.length === 0 ? (
              <div className="history-empty">
                <p>No completed puzzles yet.</p>
                <span>
                  Complete today's puzzle to start your history.
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
                      <strong>{item.game}</strong>

                      <span>
                        {new Date(item.date).toLocaleDateString(
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
                        {item.solved ? "Solved" : "Failed"}
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