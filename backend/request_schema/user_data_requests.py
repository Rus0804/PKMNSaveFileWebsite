from pydantic import BaseModel, EmailStr

class RenameRequest(BaseModel):
    filename: str

class ResetPasswordRequest(BaseModel):
    access_token: str
    new_password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ResetRequest(BaseModel):
    email: EmailStr