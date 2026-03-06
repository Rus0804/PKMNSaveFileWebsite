import os
from supabase import create_client, Client, ClientOptions
from fastapi import Header, HTTPException
# import dotenv

# FOR DEV
# dotenv.load_dotenv()

class SupabaseSecrets:
    """
    Class with all Supabase Objects
    """
    # url: str = os.getenv("SUPABASE_URL")
    # key: str = os.getenv("SUPABASE_KEY")
    # service: str = os.getenv("SUPABASE_SERVICE_KEY")

    # FOR PROD
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    service = os.environ.get("SUPABASE_SERVICE_KEY")

    db: Client = create_client(url, key)  
    service_db: Client = create_client(url, service)


def get_user_db(token: str) -> Client:
    """
    Getting the user's data from auth token
    """
    opts = ClientOptions(headers=  {"Authorization": f"Bearer {token}"})
    return create_client(SupabaseSecrets.url, SupabaseSecrets.key, options=opts)

def get_user_id_from_token(authorization: str = Header(...)) -> str:
    """
    Getting the user's id from auth token
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    
    token = authorization.removeprefix("Bearer ").strip()
    
    try:
        user_response = SupabaseSecrets.db.auth.get_user(token)
        return user_response.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Unauthorized: {str(e)}")
