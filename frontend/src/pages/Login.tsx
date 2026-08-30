import { type FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { loginUser } from "../api/auth";
import LoadingScreen from "../components/LoadingScreen";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser({
        email,
        password,
      });

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      const from =
        location.state?.from?.pathname || "/home";

      navigate(from, {
        replace: true,
      });

    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "Login failed. Please try again."
      );

      setLoading(false);
    }
  }

  if (loading) {
    return (
      <LoadingScreen
        message="Checking your credentials..."
      />
    );
  }

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          width: 100%;

          display: flex;
          flex-direction: column;

          background: #09090b;
          color: #f4f4f5;
        }

        .login-navbar {
          width: 100%;
          height: 72px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 32px;

          border-bottom: 1px solid #1f1f22;
        }

        .login-logo {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.04em;

          cursor: pointer;
        }

        .login-navbar-button {
          border: none;
          background: transparent;

          color: #a1a1aa;

          font: inherit;
          font-size: 14px;

          cursor: pointer;

          transition: color 0.2s ease;
        }

        .login-navbar-button:hover {
          color: #f4f4f5;
        }

        .login-main {
          flex: 1;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 48px 20px;
        }

        .login-card {
          width: 100%;
          max-width: 430px;

          padding: 34px;

          background: #141416;

          border: 1px solid #27272a;
          border-radius: 12px;
        }

        .login-eyebrow {
          margin: 0 0 10px;

          color: #8b5cf6;

          font-size: 11px;
          font-weight: 700;

          letter-spacing: 0.12em;
        }

        .login-card h1 {
          margin: 0;

          font-size: 34px;
          font-weight: 700;

          letter-spacing: -0.04em;
        }

        .login-subtitle {
          margin: 10px 0 28px;

          color: #a1a1aa;

          font-size: 14px;
          line-height: 1.5;
        }

        .login-form {
          display: flex;
          flex-direction: column;

          gap: 18px;
        }

        .login-field {
          display: flex;
          flex-direction: column;

          gap: 8px;
        }

        .login-field label {
          color: #d4d4d8;

          font-size: 13px;
          font-weight: 500;
        }

        .login-field input {
          width: 100%;

          padding: 13px 14px;

          border: 1px solid #2f2f33;
          border-radius: 7px;

          outline: none;

          background: #0f0f11;
          color: #f4f4f5;

          font: inherit;
          font-size: 14px;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .login-field input::placeholder {
          color: #52525b;
        }

        .login-field input:focus {
          border-color: #8b5cf6;

          box-shadow:
            0 0 0 3px
            rgba(139, 92, 246, 0.12);

          background: #111113;
        }

        .login-error {
          margin: 0;

          padding: 11px 12px;

          border: 1px solid #5c2020;
          border-radius: 6px;

          background: #241313;
          color: #fca5a5;

          font-size: 13px;
          line-height: 1.4;
        }

        .login-submit {
          width: 100%;

          margin-top: 4px;

          padding: 13px 18px;

          border: none;
          border-radius: 7px;

          background: #8b5cf6;
          color: white;

          font: inherit;
          font-size: 14px;
          font-weight: 600;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .login-submit:hover {
          background: #7c3aed;
          transform: translateY(-1px);
        }

        .login-submit:active {
          transform: translateY(0);
        }

        .login-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .login-divider {
          display: flex;
          align-items: center;

          gap: 12px;

          margin: 28px 0 20px;

          color: #52525b;

          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .login-divider::before,
        .login-divider::after {
          content: "";

          flex: 1;

          height: 1px;

          background: #27272a;
        }

        .login-register {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 6px;

          color: #71717a;

          font-size: 13px;
        }

        .login-register button {
          padding: 0;

          border: none;
          background: transparent;

          color: #a78bfa;

          font: inherit;
          font-weight: 600;

          cursor: pointer;
        }

        .login-register button:hover {
          color: #c4b5fd;
        }

        @media (max-width: 600px) {
          .login-navbar {
            height: 64px;
            padding: 0 20px;
          }

          .login-main {
            padding: 32px 16px;
          }

          .login-card {
            padding: 26px 22px;
          }

          .login-card h1 {
            font-size: 30px;
          }
        }
      `}</style>

      <div className="login-page">

        <header className="login-navbar">

          <div
            className="login-logo"
            onClick={() => navigate("/")}
          >
            cadence
          </div>

          <button
            className="login-navbar-button"
            onClick={() => navigate("/register")}
          >
            Create account
          </button>

        </header>

        <main className="login-main">

          <div className="login-card">

            <p className="login-eyebrow">
              WELCOME BACK
            </p>

            <h1>
              Log in
            </h1>

            <p className="login-subtitle">
              Continue your streak and play today's puzzles.
            </p>

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              <div className="login-field">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                  autoComplete="email"
                />

              </div>

              <div className="login-field">

                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  autoComplete="current-password"
                />

              </div>

              {error && (
                <p className="login-error">
                  {error}
                </p>
              )}

              <button
                className="login-submit"
                type="submit"
                disabled={loading}
              >
                Log in
              </button>

            </form>

            <div className="login-divider">
              New to Cadence?
            </div>

            <div className="login-register">

              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={() =>
                  navigate("/register")
                }
              >
                Sign up
              </button>

            </div>

          </div>

        </main>

      </div>
    </>
  );
}

export default Login;