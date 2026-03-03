from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from request_schema import LoginRequest, ResetPasswordRequest, ResetRequest
import requests
from .db import SupabaseSecrets

def login(request: LoginRequest):
    """
    Login function using Email/Password
    """
    try:
        response = SupabaseSecrets.db.auth.sign_in_with_password(
            {"email": request.email, "password": request.password}
        )
    except Exception as e:
        print(e)
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
    """
    Sign up with Email/Password
    """
    try:
        response = SupabaseSecrets.db.auth.sign_up({
            "email": data.email,
            "password": data.password
        })
        if response.user:
            user_id = response.user.id
            SupabaseSecrets.service_db.table("Profiles").insert({
                "id": user_id,
                "email": data.email
            }).execute()
        return {"detail": "User created successfully. Check your email to confirm your account."}
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"detail": "duplicate key value violates unique constraint"}
        )

def reset_password(req: ResetPasswordRequest):
    """
    Resetting Password function
    """
    # Use Supabase Admin API to update the user password
    headers = {
        "apikey": SupabaseSecrets.service,
        "Authorization": f"Bearer {SupabaseSecrets.service}",
        "Content-Type": "application/json"
    }

    # Get user info from token
    user_info_res = requests.get(
        f"{SupabaseSecrets.url}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {req.access_token}",
            "apikey": SupabaseSecrets.key
        }
    )

    if user_info_res.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid access token")

    user_id = user_info_res.json()["id"]

    # Update user password
    update_res = requests.put(
        f"{SupabaseSecrets.url}/auth/v1/admin/users/{user_id}",
        headers=headers,
        json={"password": req.new_password}
    )

    if update_res.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to update password")
    
    return {"message": "Password updated successfully"}


async def request_password_reset(payload: ResetRequest, request: Request):
    """
    Starting the reset password flow by sending the reset link via mail
    """
    try:
        response = SupabaseSecrets.db.table("Profiles").select("*").eq("email", payload.email).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check email: {str(e)}")
    
    if (len(response.data)==0):
        return {"message": "Incorrect Email"}
    
    origin = request.headers.get("origin")
    redirect_url = f"{origin}/reset-password"
    print(redirect_url)
    response = SupabaseSecrets.db.auth.reset_password_email(
        email=payload.email,
        options={"redirect_to": redirect_url}
    )
    if(response is not None):
        if response.get("error"):
            raise HTTPException(status_code=400, detail=response["error"]["message"])

    return {"message": "Reset link sent"}
