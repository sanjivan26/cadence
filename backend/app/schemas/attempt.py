from pydantic import BaseModel, Field


class AttemptRequest(BaseModel):
    answer: str = Field(
        min_length=1,
        max_length=200,
    )


class AttemptResponse(BaseModel):
    correct: bool
    score: int
    message: str