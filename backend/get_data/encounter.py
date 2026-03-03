import pandas as pd
import os
import json

ENCOUNTER_TYPES = ["Land", "Water", "Old Rod", "Good Rod", "Super Rod", "RockSmash"]
ENCOUNTER_NUMS = {"Land":12, "Water":5, "Old Rod":2, "Good Rod":3, "Super Rod":5, "RockSmash":5}
ENCOUNTER_DIR = "data/Encounters"
AREA_ORDER = {
                "firered":{
                    "Land":[
                        
                    ], 
                    "Water":[

                    ], 
                    "Old Rod":[

                    ], 
                    "Good Rod":[

                    ], 
                    "Super Rod":[

                    ], 
                    "RockSmash":[
                        "Rock Tunnel", "Kindle Road","Mt. Ember Exterior", "Mt. Ember Ruby Path 1F", "Mt. Ember Ruby Path B1F", "Mt. Ember Ruby Path B2F", "Mt. Ember Ruby Path B3F", "Mt. Ember Summit Path 2F","Cerulean Cave 1F","Cerulean Cave 2F","Cerulean Cave B1F"
                    ]
                }, 
                "leafgreen":{
                    "Land":[

                    ], 
                    "Water":[

                    ], 
                    "Old Rod":[

                    ], 
                    "Good Rod":[

                    ], 
                    "Super Rod":[

                    ], 
                    "RockSmash":[
                        "Rock Tunnel", "Kindle Road","Mt. Ember Exterior", "Mt. Ember Ruby Path 1F", "Mt. Ember Ruby Path B1F", "Mt. Ember Ruby Path B2F", "Mt. Ember Ruby Path B3F", "Mt. Ember Summit Path 2F","Cerulean Cave 1F","Cerulean Cave 2F","Cerulean Cave B1F"
                    ]
                }, 
                "emerald":{
                    "Land":[

                    ], 
                    "Water":[

                    ], 
                    "Old Rod":[

                    ], 
                    "Good Rod":[

                    ], 
                    "Super Rod":[

                    ], 
                    "RockSmash":[
                        "GRANITE CAVE", "ROUTE 111", "ROUTE 114", "SAFARI ZONE", "SAFARI ZONE", "VICTORY ROAD"
                    ]
                }, 
                "ruby":{
                    "Land":[

                    ], 
                    "Water":[

                    ], 
                    "Old Rod":[

                    ], 
                    "Good Rod":[

                    ], 
                    "Super Rod":[

                    ]
                }, 
                "sapphire":{
                    "Land":[

                    ], 
                    "Water":[

                    ], 
                    "Old Rod":[

                    ], 
                    "Good Rod":[

                    ], 
                    "Super Rod":[

                    ]
                }
            }


def load_encounter_data() -> dict[str, dict[str, dict[str, list]]]:
    """
    Loads all gen 3 encounter data into a dict object, and also saves it into the data folder
    """
    encounter_data = {}
    for filename in os.listdir(ENCOUNTER_DIR):
        if filename.endswith(".xlsx"):
            game = filename.replace(".xlsx", "")
            filepath = os.path.join(ENCOUNTER_DIR, filename)
            xl = pd.ExcelFile(filepath)

            encounter_data[game] = {}

            for sheet_name in ENCOUNTER_TYPES:
                if sheet_name not in xl.sheet_names:
                    continue

                df = xl.parse(sheet_name)
                grouped = {}
                df.columns = df.columns.map(str)
                for _, row in df.iterrows():
                    area = row["Area"]
                    encounters = {}
                    
                    for slot in range(0, ENCOUNTER_NUMS[sheet_name]):
                        species_col = str(slot)
                        level_col = f"Unnamed: {df.columns.get_loc(species_col) + 1}"
                        species = row.get(species_col)
                        level = row.get(level_col)
                        if pd.isna(species) or pd.isna(level):
                            continue

                        species = str(species)
                        level = str(level)

                        if species not in encounters:
                            encounters[species] = set()
                        encounters[species].add(level)

                    # Convert level sets to sorted lists
                    for species in encounters:
                        encounters[species] = sorted(list(encounters[species]))

                    grouped[area] = encounters

                encounter_data[game][sheet_name] = grouped

    with open(f"data/Encounters/gen3_encounters.json", "w") as f:
        json.dump(encounter_data, f)

    frlg_encounters = {game: encounter_data[game] for game in ["firered", "leafgreen"]}
    rse_encounters = {game: encounter_data[game] for game in ["ruby", "sapphire", "emerald"]}

    with open("data/Encounters/gen3_encounters.json", "w") as f:
        json.dump(encounter_data, f)

    with open("data/Encounters/frlg_encounters.json", "w") as f:
        json.dump(frlg_encounters, f)

    with open("data/Encounters/rse_encounters.json", "w") as f:
        json.dump(rse_encounters, f)

    return encounter_data

load_encounter_data()

            
