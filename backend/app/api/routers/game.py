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

    puzzle_data = puzzle.puzzle_data.copy()

    # Never expose the answer through the daily puzzle endpoint.
    puzzle_data.pop("answer", None)

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

    existing_attempt = db.scalar(
        select(PuzzleAttempt).where(
            PuzzleAttempt.user_id == current_user.id,
            PuzzleAttempt.puzzle_id == puzzle.id,
        )
    )

    if existing_attempt:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already attempted today's puzzle",
        )

    correct_answer = puzzle.puzzle_data["answer"]

    is_correct = (
        request.answer.strip().lower()
        == correct_answer.strip().lower()
    )

    score = 100 if is_correct else 0

    attempt = PuzzleAttempt(
        user_id=current_user.id,
        puzzle_id=puzzle.id,
        score=score,
    )

    db.add(attempt)
    db.commit()

    return AttemptResponse(
        correct=is_correct,
        score=score,
        message=(
            "Correct answer!"
            if is_correct
            else "Incorrect answer."
        ),
    )