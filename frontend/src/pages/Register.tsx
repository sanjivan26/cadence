import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { register } from "../api/auth";
import LoadingScreen from "../components/LoadingScreen";

export default function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await register({
                username,
                email,
                password,
            });

            navigate("/login");
        } catch (err: any) {
            const detail = err?.response?.data?.detail;

            if (Array.isArray(detail)) {
                setError(
                    detail
                        .map((item: any) => {
                            if (
                                item.loc?.includes("password") &&
                                item.type === "string_too_short"
                            ) {
                                return "Password must be at least 8 characters long.";
                            }

                            return item.msg || "Invalid input.";
                        })
                        .join(" ")
                );
            } else if (typeof detail === "string") {
                setError(detail);
            } else {
                setError(
                    "Registration failed. Please check your details."
                );
            }

            setLoading(false);
        }
    }

    if (loading) {
        return (
            <LoadingScreen
                message="Creating your account..."
            />
        );
    }

    return (
        <>
            <style>{`
        .register-page {
          min-height: 100vh;
          width: 100%;

          display: flex;
          flex-direction: column;

          background: #09090b;
          color: #f4f4f5;
        }

        .register-navbar {
          width: 100%;
          height: 72px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 32px;

          border-bottom: 1px solid #1f1f22;
        }

        .register-logo {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.04em;

          cursor: pointer;
        }

        .register-navbar-button {
          border: none;
          background: transparent;

          color: #a1a1aa;

          font: inherit;
          font-size: 14px;

          cursor: pointer;

          transition: color 0.2s ease;
        }

        .register-navbar-button:hover {
          color: #f4f4f5;
        }

        .register-main {
          flex: 1;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 48px 20px;
        }

        .register-card {
          width: 100%;
          max-width: 430px;

          padding: 34px;

          background: #141416;

          border: 1px solid #27272a;
          border-radius: 12px;
        }

        .register-eyebrow {
          margin: 0 0 10px;

          color: #8b5cf6;

          font-size: 11px;
          font-weight: 700;

          letter-spacing: 0.12em;
        }

        .register-card h1 {
          margin: 0;

          font-size: 34px;
          font-weight: 700;

          letter-spacing: -0.04em;
        }

        .register-subtitle {
          margin: 10px 0 28px;

          color: #a1a1aa;

          font-size: 14px;
          line-height: 1.5;
        }

        .register-form {
          display: flex;
          flex-direction: column;

          gap: 18px;
        }

        .register-field {
          display: flex;
          flex-direction: column;

          gap: 8px;
        }

        .register-field label {
          color: #d4d4d8;

          font-size: 13px;
          font-weight: 500;
        }

        .register-field input {
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

        .register-field input::placeholder {
          color: #52525b;
        }

        .register-field input:focus {
          border-color: #8b5cf6;

          box-shadow:
            0 0 0 3px
            rgba(139, 92, 246, 0.12);

          background: #111113;
        }

        .register-error {
          margin: 0;

          padding: 11px 12px;

          border: 1px solid #5c2020;
          border-radius: 6px;

          background: #241313;
          color: #fca5a5;

          font-size: 13px;
          line-height: 1.4;
        }

        .register-submit {
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

        .register-submit:hover {
          background: #7c3aed;
          transform: translateY(-1px);
        }

        .register-submit:active {
          transform: translateY(0);
        }

        .register-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .register-divider {
          display: flex;
          align-items: center;

          gap: 12px;

          margin: 28px 0 20px;

          color: #52525b;

          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .register-divider::before,
        .register-divider::after {
          content: "";

          flex: 1;

          height: 1px;

          background: #27272a;
        }

        .register-login {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 6px;

          color: #71717a;

          font-size: 13px;
        }

        .register-login button {
          padding: 0;

          border: none;
          background: transparent;

          color: #a78bfa;

          font: inherit;
          font-weight: 600;

          cursor: pointer;
        }

        .register-login button:hover {
          color: #c4b5fd;
        }

        @media (max-width: 600px) {
          .register-navbar {
            height: 64px;
            padding: 0 20px;
          }

          .register-main {
            padding: 32px 16px;
          }

          .register-card {
            padding: 26px 22px;
          }

          .register-card h1 {
            font-size: 30px;
          }
        }
      `}</style>

            <div className="register-page">

                <header className="register-navbar">

                    <div
                        className="register-logo"
                        onClick={() => navigate("/")}
                    >
                        cadence
                    </div>

                    <button
                        className="register-navbar-button"
                        onClick={() => navigate("/login")}
                    >
                        Log in
                    </button>

                </header>

                <main className="register-main">

                    <div className="register-card">

                        <p className="register-eyebrow">
                            JOIN CADENCE
                        </p>

                        <h1>
                            Create account
                        </h1>

                        <p className="register-subtitle">
                            Create an account and start building your streak.
                        </p>

                        <form
                            className="register-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="register-field">

                                <label htmlFor="username">
                                    Username
                                </label>

                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    required
                                    autoComplete="username"
                                />

                            </div>

                            <div className="register-field">

                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                    autoComplete="email"
                                />

                            </div>

                            <div className="register-field">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    autoComplete="new-password"
                                />

                            </div>

                            {error && (
                                <p className="register-error">
                                    {error}
                                </p>
                            )}

                            <button
                                className="register-submit"
                                type="submit"
                                disabled={loading}
                            >
                                Create account
                            </button>

                        </form>

                        <div className="register-divider">
                            Already a member?
                        </div>

                        <div className="register-login">

                            <span>
                                Already have an account?
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/login")
                                }
                            >
                                Log in
                            </button>

                        </div>

                    </div>

                </main>

            </div>
        </>
    );
}