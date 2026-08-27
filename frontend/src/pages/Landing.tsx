import "../App.css";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">cadence</div>

        <nav>
          <button
            className="nav-button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="nav-button primary"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
        </nav>
      </header>

      <main className="main-content">
        <section className="hero">
          <p className="eyebrow">DAILY PUZZLES</p>

          <h1>
            One puzzle.
            <br />
            Every day.
          </h1>

          <p className="subtitle">
            Challenge yourself with a new puzzle every day.
            Track your progress and build your streak.
          </p>

          <button
            className="play-button"
            onClick={() => navigate("/home")}
          >
            Play today's puzzle →
          </button>
        </section>

        <section className="game-preview">
          <div className="preview-header">
            <span>Today's game</span>
            <span className="status">LIVE</span>
          </div>

          <div className="album-card">
            <div className="album-placeholder">?</div>

            <div className="album-info">
              <p className="game-name">PixAlbum</p>
              <p className="game-description">
                Guess the album from the visual clues.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Landing;