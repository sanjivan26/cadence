import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import { getCurrentUser, type User } from "../api/auth";
import { getGames, type Game } from "../api/games";

const API_URL = import.meta.env.VITE_API_URL;

interface Clues {
  year?: number;
  artist?: string;
}

interface PuzzleData {
  type: string;
  image_url?: string;
  clues?: Clues;
}

interface DailyPuzzle {
  game: {
    slug: string;
    name: string;
    description: string | null;
  };
  puzzle: {
    id: number;
    date: string;
    data: PuzzleData;
  };
  attempts: number;
  completed: boolean;
}

interface AttemptResponse {
  correct: boolean;
  score: number;
  message: string;
  attempts: number;
  image_url: string;
  clues: Clues;
  completed: boolean;
}

function Puzzle() {
  const navigate = useNavigate();

  const { gameSlug } = useParams<{
    gameSlug: string;
  }>();

  const [puzzle, setPuzzle] =
    useState<DailyPuzzle | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [games, setGames] =
    useState<Game[]>([]);

  const [answer, setAnswer] =
    useState("");

  const [result, setResult] =
    useState<AttemptResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [menuOpen, setMenuOpen] =
    useState(false);

  // ---------------------------------------------------------
  // LOAD PUZZLE + USER + GAMES
  // ---------------------------------------------------------

  useEffect(() => {
    async function loadPage() {
      if (!gameSlug) {
        setError("Invalid game.");
        setLoading(false);
        return;
      }

      try {
        const token =
          localStorage.getItem("access_token");

        const [
          puzzleResponse,
          userData,
          gamesData,
        ] = await Promise.all([
          axios.get<DailyPuzzle>(
            `${API_URL}/games/${gameSlug}/daily`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          getCurrentUser(),

          getGames(),
        ]);

        setPuzzle(puzzleResponse.data);
        setUser(userData);
        setGames(gamesData);

      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
          "Unable to load today's puzzle."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [gameSlug]);

  // ---------------------------------------------------------
  // SUBMIT ANSWER
  // ---------------------------------------------------------

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (
      !answer.trim() ||
      submitting ||
      !puzzle
    ) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token =
        localStorage.getItem("access_token");

      const response =
        await axios.post<AttemptResponse>(
          `${API_URL}/games/${gameSlug}/today/attempt`,
          {
            answer: answer.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const data = response.data;

      setResult(data);

      setPuzzle((current) => {
        if (!current) {
          return current;
        }

        const clues: Clues = {
          ...(data.clues || {}),
        };

        return {
          ...current,
          attempts: data.attempts,
          completed: data.completed,
          puzzle: {
            ...current.puzzle,
            data: {
              ...current.puzzle.data,
              image_url: data.image_url,
              clues,
            },
          },
        };
      });

      setAnswer("");

    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "Unable to submit your answer."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------
  // NAVBAR
  // ---------------------------------------------------------

  function Navbar() {
    return (
      <header className="navbar">

        <div className="navbar-left">

          <button
            className="menu-button"
            aria-label="Open menu"
            onClick={() =>
              setMenuOpen(true)
            }
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
              7 day streak
            </span>

          </div>

          <div className="navbar-divider"></div>

          <button
            className="profile-button"
            aria-label="Profile"
            onClick={() =>
              navigate("/home")
            }
          >

            <div className="profile-avatar">
              {user
                ? user.username
                  .charAt(0)
                  .toUpperCase()
                : "C"}
            </div>

            <span className="profile-name">
              {user?.username ?? "Profile"}
            </span>

          </button>

        </div>

      </header>
    );
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="app">

        <Navbar />

        <main className="puzzle-page-state">
          <p>
            Loading today's puzzle...
          </p>
        </main>

      </div>
    );
  }

  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

  if (error && !puzzle) {
    return (
      <div className="app">

        <Navbar />

        {menuOpen && user && (
          <Sidebar
            games={games}
            user={user}
            onClose={() =>
              setMenuOpen(false)
            }
          />
        )}

        <main className="puzzle-page-state">

          <p>
            {error}
          </p>

          <button
            className="play-button"
            onClick={() =>
              navigate("/home")
            }
          >
            Back to Home
          </button>

        </main>

      </div>
    );
  }

  // ---------------------------------------------------------
  // NO PUZZLE
  // ---------------------------------------------------------

  if (!puzzle) {
    return (
      <div className="app">

        <Navbar />

        {menuOpen && user && (
          <Sidebar
            games={games}
            user={user}
            onClose={() =>
              setMenuOpen(false)
            }
          />
        )}

        <main className="puzzle-page-state">

          <p>
            No puzzle available.
          </p>

          <button
            className="play-button"
            onClick={() =>
              navigate("/home")
            }
          >
            Back to Home
          </button>

        </main>

      </div>
    );
  }

  const isCompleted =
    result?.completed ??
    puzzle.completed;

  // ---------------------------------------------------------
  // MAIN PAGE
  // ---------------------------------------------------------

  return (
    <div className="app">

      <Navbar />

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      {menuOpen && user && (
        <Sidebar
          games={games}
          user={user}
          onClose={() =>
            setMenuOpen(false)
          }
        />
      )}

      {/* =====================================================
          PUZZLE CONTENT
          ===================================================== */}

      <main className="puzzle-content">

        {/* ===================================================
            HEADER
            =================================================== */}

        <section className="puzzle-header">

          <p className="eyebrow">
            TODAY'S PUZZLE
          </p>

          <h1>
            {puzzle.game.name}
          </h1>

          {puzzle.game.description && (
            <p className="puzzle-subtitle">
              {puzzle.game.description}
            </p>
          )}

          <div className="attempt-status">

            {puzzle.attempts === 0
              ? "Make your first guess"
              : `${puzzle.attempts} of 5 attempts used`}

          </div>

        </section>

        {/* ===================================================
            ALBUM
            =================================================== */}

        <section className="puzzle-card">

          <div className="puzzle-card-header">

            <span>
              Guess the album
            </span>

            <span className="puzzle-live">
              DAILY
            </span>

          </div>

          <div className="album-card">

            {puzzle.puzzle.data.image_url ? (

              <img
                src={
                  puzzle.puzzle.data.image_url
                }
                alt="Mystery album"
                className="album-image"
              />

            ) : (

              <div className="album-placeholder">
                ?
              </div>

            )}

            <div className="album-info">

              <p className="game-name">
                Guess the album
              </p>

              <p className="game-description">
                Use the clues and enter
                your answer below.
              </p>

            </div>

          </div>

        </section>

        {/* ===================================================
            CLUES
            =================================================== */}

        {puzzle.puzzle.data.clues &&
          Object.keys(
            puzzle.puzzle.data.clues
          ).length > 0 && (

            <section className="clues">

              <div className="section-header">

                <p className="eyebrow">
                  CLUES
                </p>

              </div>

              <div className="clue-list">

                {puzzle.puzzle.data.clues.year !==
                  undefined && (

                    <div className="clue">

                      <span className="clue-label">
                        YEAR
                      </span>

                      <span className="clue-value">
                        {
                          puzzle.puzzle.data
                            .clues.year
                        }
                      </span>

                    </div>

                  )}

                {puzzle.puzzle.data.clues.artist && (

                  <div className="clue">

                    <span className="clue-label">
                      ARTIST
                    </span>

                    <span className="clue-value">
                      {
                        puzzle.puzzle.data
                          .clues.artist
                      }
                    </span>

                  </div>

                )}

              </div>

            </section>

          )}

        {/* ===================================================
            ANSWER
            =================================================== */}

        {!isCompleted ? (

          <section className="answer-section">

            <form
              onSubmit={handleSubmit}
            >

              <label
                htmlFor="answer"
                className="answer-label"
              >
                Your answer
              </label>

              <input
                id="answer"
                className="answer-input"
                type="text"
                value={answer}
                onChange={(event) =>
                  setAnswer(
                    event.target.value
                  )
                }
                placeholder="Enter album name..."
                required
                disabled={submitting}
                autoComplete="off"
              />

              <button
                className="play-button"
                type="submit"
                disabled={submitting}
              >

                {submitting
                  ? "Checking..."
                  : "Submit Answer"}

              </button>

            </form>

          </section>

        ) : (

          /* =================================================
             RESULT
             ================================================= */

          <section className="result-card">

            <p className="result-eyebrow">

              {result?.correct
                ? "PUZZLE COMPLETE"
                : "PUZZLE OVER"}

            </p>

            <h2 className="result-title">

              {result?.correct
                ? "Correct! 🎉"
                : "Game Over"}

            </h2>

            <p className="result-message">
              {result?.message}
            </p>

            <div className="result-score">

              <span className="result-score-label">
                SCORE
              </span>

              <span className="result-score-value">
                {result?.score ?? 0}
              </span>

            </div>

            <p className="result-summary">

              {result?.correct
                ? `Solved in ${result.attempts} ${result.attempts === 1
                  ? "attempt"
                  : "attempts"
                }.`
                : "You used all 5 attempts."}

            </p>

            <button
              className="play-button"
              onClick={() =>
                navigate("/home")
              }
            >
              Back to Home
            </button>

          </section>

        )}

        {/* ===================================================
            ERROR
            =================================================== */}

        {error && puzzle && (

          <div className="puzzle-error">
            {error}
          </div>

        )}

      </main>

    </div>
  );
}

export default Puzzle;