from datetime import date
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.game import Game
from app.models.puzzle import Puzzle
from app.models.user import User
from app.api.dependencies import get_current_user
from app.services.pixalbum import generate_pixalbum_images
from app.services.storage import upload_image

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


BASE_DIR = Path(__file__).resolve().parent.parent.parent

IMAGE_DIR = (
    BASE_DIR
    / "static"
    / "images"
    / "pixalbum"
)


def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:

    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user


@router.post("/puzzles")
async def create_puzzle(
    game_slug: str = Form(...),
    puzzle_date: date = Form(...),
    answer: str = Form(...),
    artist: str = Form(...),
    year: int = Form(...),
    puzzle_status: str = Form("published"),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):

    # ---------------------------------------------------------
    # FIND GAME
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # CHECK EXISTING PUZZLE
    # ---------------------------------------------------------

    existing_puzzle = db.scalar(
        select(Puzzle).where(
            Puzzle.game_id == game.id,
            Puzzle.puzzle_date == puzzle_date,
        )
    )

    if existing_puzzle:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A puzzle already exists for this game and date",
        )

    # ---------------------------------------------------------
    # GENERATE PUZZLE NUMBER
    # ---------------------------------------------------------

    last_puzzle = db.scalar(
        select(Puzzle)
        .where(
            Puzzle.game_id == game.id,
        )
        .order_by(
            Puzzle.puzzle_number.desc()
        )
    )

    next_puzzle_number = (
        last_puzzle.puzzle_number + 1
        if last_puzzle
        else 0
    )

    # ---------------------------------------------------------
    # IMAGE DIRECTORY
    # ---------------------------------------------------------

    base_dir = Path(__file__).resolve().parents[2]

    image_dir = (
        base_dir
        / "static"
        / "images"
        / game_slug
        / str(puzzle_date)
    )

    image_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # ---------------------------------------------------------
    # SAVE UPLOADED IMAGE
    # ---------------------------------------------------------

    source_path = image_dir / "original.jpg"

    try:
        contents = await image.read()

        with open(source_path, "wb") as f:
            f.write(contents)

        # -----------------------------------------------------
        # GENERATE ORIGINAL + LEVEL 1-5
        # -----------------------------------------------------

        generate_pixalbum_images(
            image_dir
        )

    except Exception as exc:
        source_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to process image: {exc}",
        )


    # ---------------------------------------------------------
    # UPLOAD GENERATED IMAGES TO SUPABASE STORAGE
    # ---------------------------------------------------------

    storage_images = {}

    for filename in [
        "original.jpg",
        "level1.jpg",
        "level2.jpg",
        "level3.jpg",
        "level4.jpg",
        "level5.jpg",
    ]:
        local_path = image_dir / filename

        if not local_path.exists():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Generated image not found: {filename}",
            )

        storage_path = (
            f"{game_slug}/{puzzle_date}/{filename}"
        )

        try:
            storage_images[filename[:-4]] = upload_image(
                local_path=local_path,
                storage_path=storage_path,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unable to upload {filename}: {exc}",
            )


    # ---------------------------------------------------------
    # CREATE PUZZLE DATA
    # ---------------------------------------------------------

    puzzle_data = {
        "type": game_slug,
        "answer": answer,
        "artist": artist,
        "year": year,
        "images": storage_images,
    }

    # ---------------------------------------------------------
    # CREATE DATABASE PUZZLE
    # ---------------------------------------------------------

    db_puzzle = Puzzle(
        game_id=game.id,
        puzzle_number=next_puzzle_number,
        puzzle_date=puzzle_date,
        status=puzzle_status,
        puzzle_data=puzzle_data,
    )

    db.add(db_puzzle)
    db.commit()
    db.refresh(db_puzzle)

    # ---------------------------------------------------------
    # RESPONSE
    # ---------------------------------------------------------

    return {
        "message": "Puzzle created successfully.",
        "puzzle_id": db_puzzle.id,
        "puzzle_number": db_puzzle.puzzle_number,
        "game": game.name,
        "date": puzzle_date,
        "images": storage_images,
    }
