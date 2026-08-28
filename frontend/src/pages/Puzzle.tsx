import { useEffect, useState, type FormEvent } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";

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

  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<AttemptResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPuzzle() {
      if (!gameSlug) {
        setError("Invalid game.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("access_token");

        const response = await axios.get<DailyPuzzle>(
          `${API_URL}/games/${gameSlug}/daily`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPuzzle(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
          "Unable to load today's puzzle."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPuzzle();
  }, [gameSlug]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!answer.trim() || submitting || !puzzle) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.post<AttemptResponse>(
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

      /*
       * Update the puzzle with only the information
       * the backend has decided to reveal.
       */
      setPuzzle((current) => {
        if (!current) return current;

        // `data.attempts` is the attempt that was just submitted.
        const attempts = data.attempts;

        const clues: Clues = {
          ...(data.clues || {}),
        };

        return {
          ...current,
          attempts,
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

  if (loading) {
    return <p>Loading today's puzzle...</p>;
  }

  if (error && !puzzle) {
    return (
      <div>
        <p>{error}</p>

        <button onClick={() => navigate("/home")}>
          Back to Home
        </button>
      </div>
    );
  }

  if (!puzzle) {
    return <p>No puzzle available.</p>;
  }

  const isCompleted = result?.completed ?? puzzle.completed;

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">cadence</div>

        <nav>
          <button
            className="nav-button"
            onClick={() => navigate("/home")}
          >
            Home
          </button>
        </nav>
      </header>

      <main className="main-content">
        <section className="hero">
          <p className="eyebrow">TODAY'S PUZZLE</p>

          <h1>{puzzle.game.name}</h1>

          <p className="subtitle">
            {puzzle.game.description}
          </p>

          <p>
            {puzzle.attempts === 0
              ? "Make your first guess"
              : `${puzzle.attempts} of 5 attempts used`}
          </p>

          <div className="album-card">
            {puzzle.puzzle.data.image_url ? (
              <img
                src={puzzle.puzzle.data.image_url}
                alt="Mystery album"
                className="album-image"
              />
            ) : (
              <div className="album-placeholder">?</div>
            )}

            <div className="album-info">
              <p className="game-name">
                Guess the album
              </p>

              <p className="game-description">
                Use the clues and enter your answer below.
              </p>
            </div>
          </div>

          {puzzle.puzzle.data.clues &&
            Object.keys(puzzle.puzzle.data.clues).length > 0 && (
              <div className="clues">
                <h2>Clues</h2>

                <div className="clue-list">
                  {puzzle.puzzle.data.clues.year !== undefined && (
                    <div className="clue">
                      <span className="clue-label">YEAR</span>
                      <span className="clue-value">
                        {puzzle.puzzle.data.clues.year}
                      </span>
                    </div>
                  )}

                  {puzzle.puzzle.data.clues.artist && (
                    <div className="clue">
                      <span className="clue-label">ARTIST</span>
                      <span className="clue-value">
                        {puzzle.puzzle.data.clues.artist}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {!isCompleted ? (
            <form onSubmit={handleSubmit}>
              <input
                className="answer-input"
                type="text"
                value={answer}
                onChange={(event) =>
                  setAnswer(event.target.value)
                }
                placeholder="Enter album name..."
                required
                disabled={submitting}
              />


              <button
                className="play-button"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Answer"}
              </button>
            </form>
          ) : (
            <div className="result-card">
              <p className="eyebrow">
                {result?.correct ? "PUZZLE COMPLETE" : "PUZZLE OVER"}
              </p>

              <h2>
                {result?.correct
                  ? "Correct! 🎉"
                  : "Game Over"}
              </h2>

              <p className="result-message">
                {result?.message}
              </p>

              {/* <div className="result-stat">
                <span className="result-stat-label">
                  ATTEMPTS
                </span>

                <strong>
                  {result?.attempts}
                </strong>
              </div> */}

              <p className="result-summary">
                {result?.correct
                  ? `Solved in ${result.attempts} ${result.attempts === 1
                    ? "attempt"
                    : "attempts"
                  }.`
                  : `You used all 5 attempts.`}
              </p>

              <button
                className="play-button"
                onClick={() => navigate("/home")}
              >
                Back to Home
              </button>
            </div>
          )}

          {error && <p>{error}</p>}
        </section>
      </main>
    </div>
  );
}

export default Puzzle;
