from pydantic import BaseModel


class AttemptRequest(BaseModel):
    answer: str


class AttemptResponse(BaseModel):
    correct: bool
    score: int
    message: str
    attempts: int
    image_url: str
    clues: dict[str, object]
    completed: bool
