from datetime import date, timedelta
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.game import Game
from app.models.puzzle import Puzzle
from app.models.user import User
from app.api.dependencies import get_current_user
from app.models.attempt import PuzzleAttempt
from app.schemas.attempt import AttemptRequest, AttemptResponse
from app.schemas.puzzle import PuzzleCreate
from app.services.pixalbum import generate_pixalbum_images

router = APIRouter(
    prefix="/games",
    tags=["Games"],
)


@router.get("/")
def get_games(
    db: Session = Depends(get_db),
):
    games = db.scalars(
        select(Game)
        .where(Game.is_active.is_(True))
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

    # ---------------------------------------------------------
    # GET USER'S EXISTING ATTEMPT
    # ---------------------------------------------------------

    attempt = db.scalar(
        select(PuzzleAttempt).where(
            PuzzleAttempt.user_id == current_user.id,
            PuzzleAttempt.puzzle_id == puzzle.id,
        )
    )

    attempts = attempt.attempts if attempt else 0
    completed = attempt.completed if attempt else False

    puzzle_data = puzzle.puzzle_data.copy()
    

    # ---------------------------------------------------------
    # IMAGE PROGRESSION
    # ---------------------------------------------------------
    #
    # 0 attempts -> level1.jpg
    # 1 attempt  -> level2.jpg
    # 2 attempts -> level3.jpg
    # 3 attempts -> level4.jpg
    # 4 attempts -> level5.jpg
    # completed  -> original.jpg
    #

    # ---------------------------------------------------------
    # IMAGE PROGRESSION
    # ---------------------------------------------------------

    images = puzzle_data.get("images", {})

    if completed:
        image_url = images.get("original")
    else:
        image_level = min(attempts + 1, 5)
        image_url = images.get(f"level{image_level}")

    if not image_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Puzzle image not found",
        )

    puzzle_data["image_url"] = image_url

    # Never expose the answer.
    puzzle_data.pop("answer", None)
    
    puzzle_data.pop("images", None)

    # ---------------------------------------------------------
    # CLUE PROGRESSION
    # ---------------------------------------------------------

    clues: dict[str, object] = {}

    # Year becomes available after 3 attempts.
    if attempts >= 2:
        clues["year"] = puzzle_data["year"]

    # Artist becomes available after 5 attempts.
    if attempts >= 4:
        clues["artist"] = puzzle_data["artist"]

    # Don't expose these fields directly.
    puzzle_data.pop("year", None)
    puzzle_data.pop("artist", None)

    puzzle_data["clues"] = clues

    # ---------------------------------------------------------
    # RESPONSE
    # ---------------------------------------------------------

    return {
        "game": {
            "slug": game.slug,
            "name": game.name,
            "description": game.description,
        },
        "puzzle": {
            "id": puzzle.id,
            "date": puzzle.puzzle_date,
            "data": puzzle_data,
        },
        "attempts": attempts,
        "completed": completed,
    }





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

    # The puzzle has already been completed.
    if attempt and attempt.completed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already completed today's puzzle",
        )

    # Create the attempt record on the first guess.
    if not attempt:
        attempt = PuzzleAttempt(
            user_id=current_user.id,
            puzzle_id=puzzle.id,
            attempts=1,
            score=0,
            completed=False,
        )

        db.add(attempt)
        db.flush()

    else:
        # Move to the next guess.
        attempt.attempts += 1

    current_attempt = attempt.attempts

    puzzle_data = puzzle.puzzle_data

    correct_answer = puzzle_data["answer"]

    is_correct = (
        request.answer.strip().lower()
        == correct_answer.strip().lower()
    )

    # ---------------------------------------------------------
    # IMAGE PROGRESSION
    # ---------------------------------------------------------
    #
    # First load      -> level1.jpg
    # Wrong attempt 1 -> level2.jpg
    # Wrong attempt 2 -> level3.jpg
    # Wrong attempt 3 -> level4.jpg
    # Wrong attempt 4 -> level5.jpg
    # Final attempt   -> original.jpg
    # Correct answer  -> original.jpg
    #

    # ---------------------------------------------------------
    # IMAGE PROGRESSION
    # ---------------------------------------------------------

    images = puzzle_data.get("images", {})

    if is_correct or current_attempt >= 5:
        image_url = images.get("original")
    else:
        image_level = current_attempt + 1
        image_url = images.get(f"level{image_level}")

    if not image_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Puzzle image URL not found",
        )

    # ---------------------------------------------------------
    # CLUE PROGRESSION
    # ---------------------------------------------------------

    clues: dict[str, object] = {}

    # Year becomes available from guess 3.
    if current_attempt >= 2:
        clues["year"] = puzzle_data["year"]

    # Artist becomes available on the final guess.
    if current_attempt >= 4:
        clues["artist"] = puzzle_data["artist"]

    # ---------------------------------------------------------
    # CORRECT ANSWER
    # ---------------------------------------------------------

    if is_correct:
        scores = {
            1: 100,
            2: 90,
            3: 75,
            4: 60,
            5: 50,
        }

        score = scores.get(current_attempt, 25)

        attempt.score = score
        attempt.solved = True
        attempt.completed = True
        

        db.commit()

        return AttemptResponse(
            correct=True,
            score=score,
            message="Correct answer!",
            attempts=current_attempt,
            image_url=image_url,
            clues=clues,
            completed=True,
        )

    # ---------------------------------------------------------
    # FINAL GUESS
    # ---------------------------------------------------------

    if current_attempt >= 5:
        attempt.score = 0
        attempt.solved = False
        attempt.completed = True

        db.commit()

        return AttemptResponse(
            correct=False,
            score=0,
            message=f"Incorrect. The answer was {correct_answer}.",
            attempts=current_attempt,
            image_url=image_url,
            clues=clues,
            completed=True,
        )

    # ---------------------------------------------------------
    # WRONG ANSWER, GAME CONTINUES
    # ---------------------------------------------------------

    db.commit()

    return AttemptResponse(
        correct=False,
        score=0,
        message="Incorrect answer. Try again.",
        attempts=current_attempt,
        image_url=image_url,
        clues=clues,
        completed=False,
    )



@router.get(
    "/progress",
)
def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ---------------------------------------------------------
    # ALL COMPLETED PUZZLES
    # ---------------------------------------------------------

    attempts = db.scalars(
        select(PuzzleAttempt)
        .where(
            PuzzleAttempt.user_id == current_user.id,
            PuzzleAttempt.completed.is_(True),
        )
        .order_by(PuzzleAttempt.completed_at.desc())
    ).all()

    completed_days = {
        attempt.completed_at.date()
        for attempt in attempts
    }

    today = date.today()

    # ---------------------------------------------------------
    # CURRENT STREAK
    # ---------------------------------------------------------

    current_streak = 0
    check_date = today

    while check_date in completed_days:
        current_streak += 1
        check_date -= timedelta(days=1)

    # ---------------------------------------------------------
    # BEST STREAK
    # ---------------------------------------------------------

    best_streak = 0
    streak = 0
    previous_date = None

    for completed_date in sorted(completed_days):
        if (
            previous_date is not None
            and (completed_date - previous_date).days == 1
        ):
            streak += 1
        else:
            streak = 1

        best_streak = max(best_streak, streak)
        previous_date = completed_date

    # ---------------------------------------------------------
    # TODAY'S GAME PROGRESS
    # ---------------------------------------------------------

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

        game_progress.append({
            "slug": game.slug,
            "completed": completed,
        })

    # ---------------------------------------------------------
    # RESPONSE
    # ---------------------------------------------------------

    return {
        "current_streak": current_streak,
        "best_streak": best_streak,
        "completed": len(attempts),
        "games": game_progress,
    }


@router.get("/history")
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
        .order_by(PuzzleAttempt.completed_at.desc())
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
            "game": game.name if game else "Unknown",
            "date": puzzle.puzzle_date,
            "attempts": attempt.attempts,
            "solved": attempt.solved,
        })

    return history