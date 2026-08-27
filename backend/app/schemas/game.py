from pydantic import BaseModel


class GameResponse(BaseModel):
    id: int
    slug: str
    name: str
    description: str | None
    is_active: bool

    class Config:
        from_attributes = True