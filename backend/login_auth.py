from fastapi import Header, Request, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client, ClientOptions
import os
# import dotenv

# dotenv.load_dotenv()

# url = os.getenv("SUPABASE_URL")
# key = os.getenv("SUPABASE_KEY")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
db: Client = create_client(url, key)  # Global root client (admin)

class LoginRequest(BaseModel):
    email: str
    password: str

def login(request: LoginRequest):
    try:
        response = db.auth.sign_in_with_password(
            {"email": request.email, "password": request.password}
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Login failed: {str(e)}",
        )

    if not response.session.access_token:
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials",
        )

    access_token = response.session.access_token
    user_id = response.user.email  
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_id
    }

def signup(data: LoginRequest):
    try:
        response = db.auth.sign_up({
            "email": data.email,
            "password": data.password
        })
        return {"message": "User created successfully. Check your email to confirm your account."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")



def get_user_id_from_token(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    
    token = authorization.removeprefix("Bearer ").strip()
    
    try:
        user_response = db.auth.get_user(token)
        return user_response.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Unauthorized: {str(e)}")

# Supabase client with RLS impersonation
def get_user_db(token: str) -> Client:
    opts = ClientOptions(headers=  {"Authorization": f"Bearer {token}"})
    return create_client(url, key, options=opts)


def update_save(save_id: int, col, data, request: Request):
    token = request.headers.get("authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = token[7:]
    user_db = get_user_db(token)
    try:
        user_db.from_("Saves").update({
            col: data
        }).eq("id", save_id).execute()

        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Supabase error: " + str(e))
