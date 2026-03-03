from pydantic import BaseModel

class BadgesUpdateRequest(BaseModel):
    badges: list[bool]

class MonUpdateRequest(BaseModel):
    pokemon: dict