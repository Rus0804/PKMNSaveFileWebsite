from fastapi import Request, HTTPException
from .db import get_user_db
from .handle_mon_updates import get_mon_dict, update_user_set_mon_data, update_mon_data
import json


def get_user_from_token(request: Request):
    """
    Getting user db from auth token
    """
    token = request.headers.get("authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = token[7:]
    return get_user_db(token)


def create_new_save(request: Request):
    """
    Creating an entry for a new save file and returning row id
    """
    user_db = get_user_from_token(request)

    try:
        response = user_db.from_("Saves").insert({
            "filename": "Untitled Save"
        }).execute()

        new_save = response.data[0]
        return {"id": new_save["id"], "filename": new_save["filename"]}
    except Exception as e:
        print("Exception:", e)
        if (e.message == 'JWT expired'):
            raise HTTPException(status_code=401, detail="User Session Timed Out")
        raise HTTPException(status_code=500, detail=f"Failed to create save: {str(e)}")

def update_save(save_id: int, col, data, request: Request, change: str):
    """
    Updating save data with parsed file data or selectively updating exisisting data
    """
    user_db = get_user_from_token(request)

    try:
        if(col == 'save_data' and change != 'all'):
            old_row = user_db.from_("Saves").select(col).eq("id",save_id).execute()
            if(change == 'trainer'):
                old_row.data[0]['save_data'][change]['badges'] = data
                data = old_row.data[0]['save_data']
            elif(change == 'pokemon'):
                done = False
                old_row = old_row.data[0]['save_data']
                for mon in range(len(old_row['party'])):
                    if old_row['party'][mon]['personality'] == data['personality']:
                        old_row['party'][mon] = data
                        done = True
                        break
                if not done:
                    for box in old_row['pc'].keys():
                        for mon in range(len(old_row['pc'][box])):
                            if old_row['pc'][box][mon]['personality'] == data['personality']:
                                old_row['pc'][box][mon] = data
                                done = True
                                break
                data = old_row

        user_db.from_("Saves").update({
            col: data
        }).eq("id", save_id).execute()

        return {"status": "success", "updated_data":data}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Supabase error: " + str(e))
    

def update_save_from_file(save_id: int, old_data: str, parsed_data: dict[str], request: Request):
    """
    Updating Save data from uploaded file
    """
    if old_data!='null':
        old_data = json.loads(old_data)
        if(parsed_data['version']== old_data['version'] and parsed_data['trainer']['trainer_id']==old_data['trainer']['trainer_id'] and parsed_data['trainer']['secret_id']==old_data['trainer']['secret_id']):
            old = get_mon_dict(old_data)
            new = get_mon_dict(parsed_data)
            updated_mon_data = update_user_set_mon_data(old, new)
            parsed_data['trainer']['badges'] = old_data['trainer']['badges']
            parsed_data = update_mon_data(parsed_data, updated_mon_data)

    try:   
        col = 'save_data'
        update_save(save_id, col, parsed_data, request, change='all')
        return parsed_data
    except Exception as e:
        print("error: ",e)
        raise HTTPException(status_code=500, detail="Supabase error: " + str(e))


def get_all_saves(request: Request):
    """
    Getting all save files asscociated with user
    """
    user_db = get_user_from_token(request)

    try:
        response = user_db.from_("Saves").select("id, filename, save_data, updated_at").execute()
        return response.data
    except Exception as e:
        print("Error fetching saves:", e)
        if (e.message == 'JWT expired'):
            raise HTTPException(status_code=401, detail="User Session Timed Out")
        raise HTTPException(status_code=500, detail="Uknown Supabase error")

def delete_save_id(save_id: int, request: Request):
    """
    Deleting save data based on id
    """
    user_db = get_user_from_token(request)

    try:
        response = user_db.from_("Saves").delete().eq("id", save_id).execute()
        print("Delete response:", response.data)
        return {"status": "success"}
    except Exception as e:
        print("Deletion error:", e)
        raise HTTPException(status_code=500, detail="Supabase error: " + str(e))
