from datetime import date, datetime

from pydantic import BaseModel


class DailyPuzzleResponse(BaseModel):
    id: int
    game_id: int
    puzzle_date: date
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class PuzzleCreate(BaseModel):
    game_slug: str
    puzzle_date: date
    puzzle_data: dict
    status: str = "published"