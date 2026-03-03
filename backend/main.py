from fastapi import FastAPI, UploadFile, File, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from request_schema import *
from typing import Optional
from save_file_parsing import parse_save_file
from db_operations import (
        login, 
        update_save, 
        signup, 
        reset_password, 
        request_password_reset, 
        create_new_save, 
        get_all_saves,
        delete_save_id,
        update_save_from_file
    )
import json

app = FastAPI()

origins = [
    "http://localhost:3000",  # Development frontend
    "https://pokesavegen3.netlify.app"  # Production frontend
]

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/test")
def test():
    return {"message": "test OK"}

@app.post("/signup")
async def set_signup(request: LoginRequest):
    print("New user req")
    return signup(request)

@app.post("/login")
def set_login(request: LoginRequest):
    return login(request)


@app.post("/reset-password")
def forgot_password(req: ResetPasswordRequest):
    print('reset password req recieved')
    return reset_password(req)

@app.post("/request-password-reset")
async def set_request_reset(payload: ResetRequest, request: Request):
    print("reset password email req")
    return await request_password_reset(payload, request)

@app.get("/saves")
def get_user_saves(request: Request):
    return get_all_saves(request)

@app.post("/saves/new")
def create_new_save(request: Request):
    return create_new_save(request)

@app.patch("/saves/{save_id}")
def rename_save(save_id: int, data: RenameRequest, request: Request):
    col = 'filename'
    value = data.filename
    return update_save(save_id, col, value, request, change = 'name')

@app.patch("/saves/{save_id}/badges")
def update_badges(save_id: int, data: BadgesUpdateRequest, request: Request):
    col = 'save_data'
    value = data.badges
    print(save_id, "badges: ", value)
    return update_save(save_id, col, value, request, change='trainer')

@app.patch("/saves/{save_id}/pokemon")
def update_pokemon_data(save_id: int, data: MonUpdateRequest, request: Request):
    col = 'save_data'
    value = data.pokemon
    print(save_id, "data: ", value)
    return update_save(save_id, col, value, request, change='pokemon')
    
@app.delete("/saves/{save_id}")
def delete_save(save_id: int, request: Request):
    return delete_save_id(save_id, request)
    
@app.get("/encounters")
def get_encounters(ver:str):
    with open(f"data/Encounters/{ver}_encounters.json", "r") as f:
        encounter_data = json.load(f)
    return encounter_data

@app.post("/upload")
async def upload_file(request: Request, save_id: Optional[int] = Form(None) ,  old_data: Optional[str] = Form(None), file: UploadFile = File(...)):
    contents = await file.read()
    result = parse_save_file(contents)
    if result == "SaveFileError":
        return JSONResponse(content={"detail": "SaveFileError"})
    if save_id:
        result = update_save_from_file(save_id, old_data, result, request)
    return JSONResponse(content=result)
