from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
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

    # ---------------------------------------------------------
    # PREPARE PUZZLE DATA
    # ---------------------------------------------------------

    puzzle_data = puzzle.puzzle_data.copy()

    # Never expose the answer to the frontend.
    puzzle_data.pop("answer", None)

    # ---------------------------------------------------------
    # IMAGE PROGRESSION
    # ---------------------------------------------------------
    #
    # 0 attempts -> original.jpg
    # 1 attempt  -> level1.jpg
    # 2 attempts -> level2.jpg
    # 3 attempts -> level3.jpg
    # 4 attempts -> level4.jpg
    # 5 attempts -> level5.jpg
    #

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

    if completed:
        image_url = "/images/pixalbum/original.jpg"
    else:
        image_level = min(attempts + 1, 5)
        image_url = f"/images/pixalbum/level{image_level}.jpg"

    puzzle_data["image_url"] = image_url

    # Never expose the answer.
    puzzle_data.pop("answer", None)

    # ---------------------------------------------------------
    # CLUE PROGRESSION
    # ---------------------------------------------------------

    clues: dict[str, object] = {}

    # Year becomes available after 3 attempts.
    if attempts >= 3:
        clues["year"] = puzzle_data["year"]

    # Artist becomes available after 5 attempts.
    if attempts >= 5:
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

    if is_correct or current_attempt >= 5:
        image_url = "/images/pixalbum/original.jpg"
    else:
        image_level = current_attempt + 1
        image_url = f"/images/pixalbum/level{image_level}.jpg"

    # ---------------------------------------------------------
    # CLUE PROGRESSION
    # ---------------------------------------------------------

    clues: dict[str, object] = {}

    # Year becomes available from guess 3.
    if current_attempt >= 3:
        clues["year"] = puzzle_data["year"]

    # Artist becomes available on the final guess.
    if current_attempt >= 5:
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
