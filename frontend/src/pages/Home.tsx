import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, type User } from "../api/auth";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch {
        setError("You are not authenticated.");
      }
    }

    loadUser();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">cadence</div>

        <nav>
          <span className="nav-user">
            {user.username}
          </span>

          <button
            className="nav-button"
            onClick={() => {
              localStorage.removeItem("access_token");
              navigate("/");
            }}
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="main-content">
        <section className="hero">
          <p className="eyebrow">WELCOME BACK</p>

          <h1>
            Ready to play,
            <br />
            {user.username}?
          </h1>

          <p className="subtitle">
            A new puzzle is waiting for you today.
          </p>

          <button
            className="play-button"
            onClick={() => navigate("/games/pixalbum/daily")}
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

export default Home;

