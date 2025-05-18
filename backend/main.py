from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Optional
from pokemon_info import get_mon_dict, update_pokemon
from parser import parse_save_file, update_data
from encounter import load_encounter_data
from login_auth import get_user_db, login, LoginRequest, update_save, signup, ResetPasswordRequest, reset_password, ResetRequest, request_password_reset
import json

app = FastAPI()

origins = [
    "http://localhost:3000",  # Development frontend
    "https://pokemongen3saves.netlify.app"  # Production frontend
]

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

@app.get("/test")
def test():
    return {"message": "test OK"}

@app.post("/request-password-reset")
async def set_request_reset(payload: ResetRequest, request: Request):
    print("reset password email req")
    return await request_password_reset(payload, request)

@app.get("/saves")
def get_user_saves(request: Request):
    token = request.headers.get("authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = token[7:]
    user_db = get_user_db(token)

    try:
        response = user_db.from_("Saves").select("id, filename, save_data, updated_at").execute()
        return response.data
    except Exception as e:
        print("Error fetching saves:", e)
        raise HTTPException(status_code=500, detail="Supabase error")

@app.post("/saves/new")
def create_new_save(request: Request):
    token = request.headers.get("authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = token[7:]
    user_db = get_user_db(token)

    try:
        response = user_db.from_("Saves").insert({
            "filename": "Untitled Save"
        }).execute()

        new_save = response.data[0]
        return {"id": new_save["id"], "filename": new_save["filename"]}
    except Exception as e:
        print("Exception:", e)
        raise HTTPException(status_code=500, detail=f"Failed to create save: {str(e)}")

class RenameRequest(BaseModel):
    filename: str

@app.patch("/saves/{save_id}")
def rename_save(save_id: int, data: RenameRequest, request: Request):
    col = 'filename'
    value = data.filename
    return update_save(save_id, col, value, request)

class BadgesUpdateRequest(BaseModel):
    badges: list[bool]

@app.patch("/saves/{save_id}/badges")
def update_badges(save_id: int, data: BadgesUpdateRequest, request: Request):
    col = 'save_data'
    value = data.badges
    print(save_id, "badges: ", value)
    return update_save(save_id, col, value, request, change='trainer')

class MonUpdateRequest(BaseModel):
    pokemon: dict

@app.patch("/saves/{save_id}/pokemon")
def update_pokemon(save_id: int, data: MonUpdateRequest, request: Request):
    col = 'save_data'
    value = data.pokemon
    print(save_id, "data: ", value)
    return update_save(save_id, col, value, request, change='pokemon')
    
@app.delete("/saves/{save_id}")
def delete_save(save_id: int, request: Request):
    token = request.headers.get("authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = token[7:]
    user_db = get_user_db(token)

    try:
        response = user_db.from_("Saves").delete().eq("id", save_id).execute()
        print("Delete response:", response.data)
        return {"status": "success"}
    except Exception as e:
        print("Deletion error:", e)
        raise HTTPException(status_code=500, detail="Supabase error: " + str(e))
    

encounter_data: Dict[str, Dict[str, Dict[str, list]]] = {}

@app.on_event('startup')
def startup_event():
    global encounter_data
    encounter_data = load_encounter_data(encounter_data)

@app.get("/encounters")
def get_encounters():
    global encounter_data
    return encounter_data

@app.post("/upload")
async def upload_file(request: Request, save_id: Optional[int] = Form(None) ,  old_data: Optional[str] = Form(None), file: UploadFile = File(...)):
    contents = await file.read()
    result = parse_save_file(contents)
    if result == "SaveFileError":
        result = {"detail": "SaveFileError"}
    if save_id:
        if old_data!='null':
            old_data = json.loads(old_data)
            if(result['version']== old_data['version'] and result['trainer']['trainer_id']==old_data['trainer']['trainer_id'] and result['trainer']['secret_id']==old_data['trainer']['secret_id']):
                old = get_mon_dict(old_data)
                new = get_mon_dict(result)
                updated_mon_data = update_pokemon(old, new)
                result['trainer']['badges'] = old_data['trainer']['badges']
                result = update_data(result, updated_mon_data)

        try:   
            col = 'save_data'
            update_save(save_id, col, result, request, change='all')
        except Exception as e:
            print("error: ",e)
            raise HTTPException(status_code=500, detail="Supabase error: " + str(e))
        
    return JSONResponse(content=result)


# from fastapi.routing import APIRoute

# for route in app.routes:
#     if isinstance(route, APIRoute):
#         print(f"Route: {route.path} (methods: {route.methods})")