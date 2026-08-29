import "../App.css";
import { useNavigate } from "react-router-dom";
import { gameIcons } from "../components/GameIcons";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="app landing-page">

      {/* =========================================
          NAVBAR
          ========================================= */}
      <header className="navbar">

        <div className="navbar-left">
          <div className="logo">
            cadence
          </div>
        </div>

        <div className="navbar-right">

          <button
            className="landing-login"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>

          <button
            className="landing-signup"
            onClick={() => navigate("/register")}
          >
            Sign up
          </button>

        </div>

      </header>


      {/* =========================================
          MAIN
          ========================================= */}
      <main className="landing-content">

        {/* Hero */}
        <section className="landing-hero">

          {/* <p className="landing-eyebrow">
            WELCOME TO CADENCE
          </p> */}

          <h1>
            Music puzzles,
            <br />
            Every day!
          </h1>

          <p className="landing-subtitle">
            Challenge yourself with a new puzzle every day.
            Track your progress, build your streak, and see
            how far you can go.
          </p>

          <div className="landing-actions">

            <button
              className="landing-play"
              onClick={() => navigate("/home")}
            >
              Play today's puzzle
              <span>→</span>
            </button>

          </div>

        </section>


        {/* Today's game */}
        <section className="landing-game">

          <div className="landing-game-header">

            <div>

              <p className="landing-game-label">
                TODAY'S GAME
              </p>

              <h2>
                PixAlbum
              </h2>

            </div>

            <span className="landing-live">
              LIVE
            </span>

          </div>


          <div className="landing-album">

            <div className="landing-album-art">
              {gameIcons.pixalbum}
            </div>

            <div className="landing-album-info">

              <p className="landing-album-type">
                DAILY PUZZLE
              </p>

              <h3>
                PixAlbum
              </h3>

              <p>
                Guess the album from the visual clues.
              </p>

            </div>

          </div>


          <div className="landing-game-footer">

            <span>
              New puzzle every day
            </span>

            <button
              onClick={() => navigate("/home")}
            >
              Play
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Landing;