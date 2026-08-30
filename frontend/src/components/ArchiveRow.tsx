import { useRef } from "react";
import type { ArchiveGame } from "../api/archive";
import ArchiveCard from "./ArchiveCard";

interface ArchiveRowProps {
    game: ArchiveGame;
    onViewAll: () => void;
    onPuzzleClick: (puzzleId: number) => void;
}

function ArchiveRow({
    game,
    onViewAll,
    onPuzzleClick,
}: ArchiveRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!rowRef.current) return;

        rowRef.current.scrollBy({
            left:
                direction === "right"
                    ? 500
                    : -500,
            behavior: "smooth",
        });
    };

    const puzzles = game.puzzles.slice(0, 10);

    return (
        <section className="archive-row">

            <div className="archive-row-header">

                <h2>
                    {game.name}
                </h2>

                <button
                    className="archive-view-all"
                    onClick={onViewAll}
                >
                    View all
                </button>

            </div>

            <div className="archive-carousel-wrapper">

                <button
                    className="archive-scroll archive-scroll-left"
                    onClick={() => scroll("left")}
                    aria-label="Scroll left"
                >
                    ‹
                </button>

                <div
                    className="archive-carousel"
                    ref={rowRef}
                >
                    {puzzles.map((puzzle) => (
                        <ArchiveCard
                            key={puzzle.puzzle_id}
                            puzzle={puzzle}
                            gameName={game.name}
                            onClick={() =>
                                onPuzzleClick(
                                    puzzle.puzzle_id
                                )
                            }
                        />
                    ))}
                </div>

                <button
                    className="archive-scroll archive-scroll-right"
                    onClick={() => scroll("right")}
                    aria-label="Scroll right"
                >
                    ›
                </button>

            </div>

        </section>
    );
}

export default ArchiveRow;