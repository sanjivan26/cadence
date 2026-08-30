from datetime import date, timedelta

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.game import Game
from app.models.puzzle import Puzzle
from app.models.user import User
from app.api.dependencies import get_current_user
from app.models.attempt import PuzzleAttempt
from app.schemas.attempt import AttemptRequest, AttemptResponse


router = APIRouter(
    prefix="/games",
    tags=["Games"],
)


# =========================================================
# HELPER — CALCULATE USER STREAK
# =========================================================

def calculate_streak(
    db: Session,
    user_id: int,
):
    """
    Calculate the user's current and best streak.

    Only successfully solved puzzles count toward a streak.
    A puzzle that was completed after 5 failed attempts does
    NOT count.

    Streak dates are based on the puzzle's puzzle_date rather
    than completed_at, avoiding timezone-related issues.
    """

    solved_attempts = db.scalars(
        select(PuzzleAttempt)
        .where(
            PuzzleAttempt.user_id == user_id,
            PuzzleAttempt.solved.is_(True),
            PuzzleAttempt.completed.is_(True),
        )
    ).all()

    solved_days = set()

    for attempt in solved_attempts:

        puzzle = db.scalar(
            select(Puzzle).where(
                Puzzle.id == attempt.puzzle_id
            )
        )

        if puzzle:
            solved_days.add(
                puzzle.puzzle_date
            )

    today = date.today()

    # -----------------------------------------------------
    # CURRENT STREAK
    # -----------------------------------------------------
    #
    # If today's puzzle has been solved, count from today.
    #
    # If today's puzzle has NOT been solved yet, count from
    # yesterday so the current streak remains active during
    # the current day.
    #
    # If yesterday wasn't solved either, the streak is 0.
    #

    current_streak = 0

    if today in solved_days:
        check_date = today
    else:
        check_date = today - timedelta(days=1)

    while check_date in solved_days:
        current_streak += 1
        check_date -= timedelta(days=1)

    # -----------------------------------------------------
    # BEST STREAK
    # -----------------------------------------------------

    best_streak = 0
    streak = 0
    previous_date = None

    for solved_date in sorted(solved_days):

        if (
            previous_date is not None
            and (solved_date - previous_date).days == 1
        ):
            streak += 1
        else:
            streak = 1

        best_streak = max(
            best_streak,
            streak,
        )

        previous_date = solved_date

    return {
        "current_streak": current_streak,
        "best_streak": best_streak,
    }


# =========================================================
# GET GAMES
# =========================================================

@router.get("/")
def get_games(
    db: Session = Depends(get_db),
):
    games = db.scalars(
        select(Game)
        .where(
            Game.is_active.is_(True)
        )
        .order_by(Game.id)
    ).all()

    return [
        {
            "slug": game.slug,
            "name": game.name,
            "description": game.description,
        }
        for game in games
    ]


# =========================================================
# GET TODAY'S PUZZLE
# =========================================================

@router.get(
    "/{game_slug}/daily",
)
def get_today_puzzle(
    game_slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    game = db.scalar(
        select(Game).where(
            Game.slug == game_slug,
            Game.is_active.is_(True),
        )
    )

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    puzzle = db.scalar(
        select(Puzzle).where(
            Puzzle.game_id == game.id,
            Puzzle.puzzle_date == date.today(),
            Puzzle.status == "published",
        )
    )

    if not puzzle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Today's puzzle is not available",
        )

    # -----------------------------------------------------
    # GET USER'S EXISTING ATTEMPT
    # -----------------------------------------------------

    attempt = db.scalar(
        select(PuzzleAttempt).where(
            PuzzleAttempt.user_id == current_user.id,
            PuzzleAttempt.puzzle_id == puzzle.id,
        )
    )

    attempts = (
        attempt.attempts
        if attempt
        else 0
    )

    completed = (
        attempt.completed
        if attempt
        else False
    )

    solved = (
        attempt.solved
        if attempt
        else False
    )

    puzzle_data = puzzle.puzzle_data.copy()

    # -----------------------------------------------------
    # IMAGE PROGRESSION
    # -----------------------------------------------------

    images = puzzle_data.get(
        "images",
        {},
    )

    if completed:
        image_url = images.get(
            "original"
        )
    else:
        image_level = min(
            attempts + 1,
            5,
        )

        image_url = images.get(
            f"level{image_level}"
        )

    if not image_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Puzzle image not found",
        )

    puzzle_data["image_url"] = image_url

    # Never expose answer or image paths.
    puzzle_data.pop(
        "answer",
        None,
    )

    puzzle_data.pop(
        "images",
        None,
    )

    # -----------------------------------------------------
    # CLUE PROGRESSION
    # -----------------------------------------------------

    clues: dict[str, object] = {}

    # Year after 2 attempts.
    if attempts >= 2:
        clues["year"] = puzzle_data["year"]

    # Artist after 4 attempts.
    if attempts >= 4:
        clues["artist"] = puzzle_data["artist"]

    puzzle_data.pop(
        "year",
        None,
    )

    puzzle_data.pop(
        "artist",
        None,
    )

    puzzle_data["clues"] = clues

    # -----------------------------------------------------
    # STREAK
    # -----------------------------------------------------

    streak_data = calculate_streak(
        db,
        current_user.id,
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "game": {
            "slug": game.slug,
            "name": game.name,
            "description": game.description,
        },

        "puzzle": {
            "id": puzzle.id,
            "number": puzzle.puzzle_number,
            "date": puzzle.puzzle_date,
            "data": puzzle_data,
        },

        "attempts": attempts,

        "completed": completed,

        "solved": solved,

        "current_streak": streak_data[
            "current_streak"
        ],

        "best_streak": streak_data[
            "best_streak"
        ],
    }


# =========================================================
# SUBMIT ANSWER
# =========================================================

@router.post(
    "/{game_slug}/today/attempt",
    response_model=AttemptResponse,
)
def submit_attempt(
    game_slug: str,
    request: AttemptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    game = db.scalar(
        select(Game).where(
            Game.slug == game_slug,
            Game.is_active.is_(True),
        )
    )

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    puzzle = db.scalar(
        select(Puzzle).where(
            Puzzle.game_id == game.id,
            Puzzle.puzzle_date == date.today(),
            Puzzle.status == "published",
        )
    )

    if not puzzle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Today's puzzle is not available",
        )

    attempt = db.scalar(
        select(PuzzleAttempt).where(
            PuzzleAttempt.user_id == current_user.id,
            PuzzleAttempt.puzzle_id == puzzle.id,
        )
    )

    # -----------------------------------------------------
    # ALREADY COMPLETED
    # -----------------------------------------------------

    if attempt and attempt.completed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already completed today's puzzle",
        )

    # -----------------------------------------------------
    # CREATE / INCREMENT ATTEMPT
    # -----------------------------------------------------

    if not attempt:

        attempt = PuzzleAttempt(
            user_id=current_user.id,
            puzzle_id=puzzle.id,
            attempts=1,
            score=0,
            completed=False,
            solved=False,
        )

        db.add(attempt)
        db.flush()

    else:

        attempt.attempts += 1

    current_attempt = attempt.attempts

    puzzle_data = puzzle.puzzle_data

    correct_answer = puzzle_data["answer"]

    is_correct = (
        request.answer.strip().lower()
        == correct_answer.strip().lower()
    )

    # -----------------------------------------------------
    # IMAGE PROGRESSION
    # -----------------------------------------------------

    images = puzzle_data.get(
        "images",
        {},
    )

    if (
        is_correct
        or current_attempt >= 5
    ):
        image_url = images.get(
            "original"
        )
    else:
        image_level = current_attempt + 1

        image_url = images.get(
            f"level{image_level}"
        )

    if not image_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Puzzle image URL not found",
        )

    # -----------------------------------------------------
    # CLUE PROGRESSION
    # -----------------------------------------------------

    clues: dict[str, object] = {}

    if current_attempt >= 2:
        clues["year"] = puzzle_data["year"]

    if current_attempt >= 4:
        clues["artist"] = puzzle_data["artist"]

    # =====================================================
    # CORRECT ANSWER
    # =====================================================

    if is_correct:

        scores = {
            1: 100,
            2: 90,
            3: 75,
            4: 60,
            5: 50,
        }

        score = scores.get(
            current_attempt,
            25,
        )

        attempt.score = score

        attempt.solved = True

        attempt.completed = True

        # Keep completed_at for history/auditing.
        attempt.completed_at = (
            __import__("datetime")
            .datetime.utcnow()
        )

        db.commit()

        return AttemptResponse(
            correct=True,
            score=score,
            message="Correct answer!",
            attempts=current_attempt,
            image_url=image_url,
            clues=clues,
            completed=True,
            solved=True,
        )

    # =====================================================
    # FINAL GUESS
    # =====================================================

    if current_attempt >= 5:

        attempt.score = 0

        attempt.solved = False

        attempt.completed = True

        attempt.completed_at = (
            __import__("datetime")
            .datetime.utcnow()
        )

        db.commit()

        return AttemptResponse(
            correct=False,
            score=0,
            message=(
                f"Incorrect. The answer was "
                f"{correct_answer}."
            ),
            attempts=current_attempt,
            image_url=image_url,
            clues=clues,
            completed=True,
            solved=False,
        )

    # =====================================================
    # WRONG ANSWER — GAME CONTINUES
    # =====================================================

    db.commit()

    return AttemptResponse(
        correct=False,
        score=0,
        message="Incorrect answer. Try again.",
        attempts=current_attempt,
        image_url=image_url,
        clues=clues,
        completed=False,
        solved=False,
    )


# =========================================================
# GET PROGRESS
# =========================================================

@router.get(
    "/progress",
)
def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # -----------------------------------------------------
    # ALL COMPLETED PUZZLES
    # -----------------------------------------------------

    attempts = db.scalars(
        select(PuzzleAttempt)
        .where(
            PuzzleAttempt.user_id == current_user.id,
            PuzzleAttempt.completed.is_(True),
        )
        .order_by(
            PuzzleAttempt.completed_at.desc()
        )
    ).all()

    streak_data = calculate_streak(
        db,
        current_user.id,
    )

    current_streak = streak_data[
        "current_streak"
    ]

    best_streak = streak_data[
        "best_streak"
    ]

    today = date.today()

    # -----------------------------------------------------
    # TODAY'S GAME PROGRESS
    # -----------------------------------------------------

    games = db.scalars(
        select(Game)
        .where(
            Game.is_active.is_(True)
        )
        .order_by(Game.id)
    ).all()

    game_progress = []

    for game in games:

        today_puzzle = db.scalar(
            select(Puzzle)
            .where(
                Puzzle.game_id == game.id,
                Puzzle.puzzle_date == today,
                Puzzle.status == "published",
            )
        )

        completed = False
        solved = False
        attempts_count = 0

        if today_puzzle:

            today_attempt = db.scalar(
                select(PuzzleAttempt)
                .where(
                    PuzzleAttempt.user_id == current_user.id,
                    PuzzleAttempt.puzzle_id == today_puzzle.id,
                )
            )

            if today_attempt:
                completed = today_attempt.completed
                solved = today_attempt.solved
                attempts_count = today_attempt.attempts

        game_progress.append({
            "slug": game.slug,
            "completed": completed,
            "solved": solved,
            "attempts": attempts_count,
            "puzzle_number": (
                today_puzzle.puzzle_number
                if today_puzzle
                else None
            ),
        })

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "current_streak": current_streak,
        "best_streak": best_streak,
        "completed": len(attempts),
        "games": game_progress,
    }


# =========================================================
# HISTORY
# =========================================================

@router.get(
    "/history"
)
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    attempts = db.scalars(
        select(PuzzleAttempt)
        .where(
            PuzzleAttempt.user_id == current_user.id,
            PuzzleAttempt.completed.is_(True),
        )
        .order_by(
            PuzzleAttempt.completed_at.desc()
        )
    ).all()

    history = []

    for attempt in attempts:

        puzzle = db.scalar(
            select(Puzzle).where(
                Puzzle.id == attempt.puzzle_id
            )
        )

        if not puzzle:
            continue

        game = db.scalar(
            select(Game).where(
                Game.id == puzzle.game_id
            )
        )

        history.append({
            "puzzle_id": puzzle.id,
            "puzzle_number": puzzle.puzzle_number,
            "game": (
                game.name
                if game
                else "Unknown"
            ),
            "date": puzzle.puzzle_date,
            "attempts": attempt.attempts,
            "solved": attempt.solved,
        })

    return history

# =========================================================
# ARCHIVE
# =========================================================

@router.get(
    "/archive",
)
def get_archive(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # -----------------------------------------------------
    # GET ACTIVE GAMES
    # -----------------------------------------------------

    games = db.scalars(
        select(Game)
        .where(
            Game.is_active.is_(True)
        )
        .order_by(Game.id)
    ).all()

    archive = []

    # -----------------------------------------------------
    # BUILD ARCHIVE FOR EACH GAME
    # -----------------------------------------------------

    for game in games:

        puzzles = db.scalars(
            select(Puzzle)
            .where(
                Puzzle.game_id == game.id,
                Puzzle.status == "published",
                Puzzle.puzzle_date <= date.today(),
            )
            .order_by(
                Puzzle.puzzle_number.desc()
            )
        ).all()

        game_puzzles = []

        for puzzle in puzzles:

            attempt = db.scalar(
                select(PuzzleAttempt).where(
                    PuzzleAttempt.user_id == current_user.id,
                    PuzzleAttempt.puzzle_id == puzzle.id,
                )
            )
            
            image_url = None

            if attempt and attempt.completed:
                image_url = puzzle.puzzle_data.get(
                    "images",
                    {}
                ).get("original")

            game_puzzles.append({
                "puzzle_id": puzzle.id,
                "puzzle_number": puzzle.puzzle_number,
                "date": puzzle.puzzle_date,
                "completed": (
                    attempt.completed
                    if attempt
                    else False
                ),
                "solved": (
                    attempt.solved
                    if attempt
                    else False
                ),
                "attempts": (
                    attempt.attempts
                    if attempt
                    else 0
                ),
                "score": (
                    attempt.score
                    if attempt
                    else 0
                ),
                "image_url": image_url,
            })

        archive.append({
            "slug": game.slug,
            "name": game.name,
            "puzzles": game_puzzles,
        })

    return archive