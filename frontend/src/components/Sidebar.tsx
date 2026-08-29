import { useNavigate } from "react-router-dom";

import type { Game } from "../api/games";
import type { User } from "../api/auth";

import { gameIcons } from "./GameIcons";
import HomeIcon from "./HomeIcon";

interface SidebarProps {
    games: Game[];
    user: User;
    onClose: () => void;
}

function Sidebar({
    games,
    user,
    onClose,
}: SidebarProps) {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("access_token");
        navigate("/login");
    }

    return (
        <>
            <div
                className="menu-overlay"
                onClick={onClose}
            />

            <aside className="side-menu">

                <div className="side-menu-header">

                    <div className="side-menu-logo">
                        cadence
                    </div>

                    <button
                        className="close-menu"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        ×
                    </button>

                </div>

                <nav className="side-menu-nav">

                    {/* Navigate */}
                    <div className="menu-section-title">
                        Navigate
                    </div>

                    <button
                        onClick={() => {
                            onClose();
                            navigate("/");
                        }}
                    >
                        <HomeIcon />

                        Home
                    </button>


                    {/* Games */}
                    <div className="menu-section-title">
                        Games
                    </div>

                    {games.map((game) => (
                        <button
                            key={game.slug}
                            onClick={() => {
                                onClose();
                                navigate(`/games/${game.slug}/daily`);
                            }}
                        >
                            <span className="game-menu-icon">
                                {gameIcons[game.slug] ?? "♪"}
                            </span>

                            {game.name}
                        </button>
                    ))}


                    {/* Admin */}
                    {user.is_admin && (
                        <>
                            <div className="menu-section-title admin-menu-title">
                                Admin
                            </div>

                            <button
                                className="admin-menu-button"
                                onClick={() => {
                                    onClose();
                                    navigate("/admin/puzzles");
                                }}
                            >
                                <span className="game-menu-icon">
                                    +
                                </span>

                                Add Puzzle
                            </button>
                        </>
                    )}

                </nav>



                <div className="side-menu-bottom">

                    <button
                        onClick={() => {
                            onClose();
                            handleLogout();
                        }}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>
        </>
    );
}

export default Sidebar;