import type { ArchivePuzzle } from "../api/archive";
import { gameIcons } from "./GameIcons";

interface ArchiveCardProps {
    puzzle: ArchivePuzzle;
    gameName: string;
    onClick: () => void;
}

function ArchiveCard({
    puzzle,
    gameName,
    onClick,
}: ArchiveCardProps) {
    const formattedDate = new Date(
        puzzle.date
    ).toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
        }
    );

    return (
        <div
            className="archive-card"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {
                    onClick();
                }
            }}
        >
            <div className="archive-card-art">
                {puzzle.image_url ? (
                    <img
                        src={puzzle.image_url}
                        alt={`${gameName} #${puzzle.puzzle_number}`}
                    />
                ) : (
                    <div className="archive-card-placeholder">
                        {gameName === "PixAlbum" && gameIcons["pixalbum"]}
                    </div>
                )}
            </div>

            <div className="archive-card-info">

                <strong>
                    {gameName} #{puzzle.puzzle_number}
                </strong>

                <span>
                    {formattedDate}
                </span>

            </div>

            <div className="archive-card-status">

                {puzzle.completed ? (
                    puzzle.solved ? (
                        <span className="archive-solved">
                            ✓ Solved
                        </span>
                    ) : (
                        <span className="archive-failed">
                            Failed
                        </span>
                    )
                ) : (
                    <span className="archive-unplayed">
                        Not played
                    </span>
                )}

            </div>
        </div>
    );
}

export default ArchiveCard;