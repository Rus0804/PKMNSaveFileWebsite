import pandas as pd
from data.Pokemon.move_data import move_data
from data.Opponents.trainer_genders import genders_frlg
from data.Opponents.trainer_ivs import *
import ast
import json
import math
from .text_decode import e_map

def format_opponent(row, grunt_name):
    if row["Opponent"] == grunt_name:
        route = str(row["Route"]) if pd.notna(row["Route"]) else ""
        location = str(row["Location on Route"]) if pd.notna(row["Location on Route"]) else ""
        count = int(row["Grunt_Count"])

        if location:
            return f"{grunt_name} {count} - {route} ({location})"
        else:
            return f"{grunt_name} {count} - {route}"
    return row["Opponent"]

def correct_grunt_names(data: pd.DataFrame, grunt_name):
    # Create mask for Team Rocket Grunt
    mask = data["Opponent"] == grunt_name

    # Create running count for grunts
    data.loc[mask, "Grunt_Count"] = (
        data.loc[mask]
        .groupby("Opponent")
        .cumcount() + 1
    )
    data["Opponent"] = data.apply(format_opponent, axis=1, args=(grunt_name,))
    data.drop(
        [
            "Grunt_Count"
        ],
        inplace=True,
        axis=1
    )

    return data

## Read source sheet
def set_data(sheet_req: str) -> pd.DataFrame:
    """
    Getting the data of the appropriate game
    """
    datasheets = pd.read_excel(
        "./data/Opponents/Pokemon Gen 3 Trainers DataSheet.xlsx",
        sheet_name=[
            "Emerald Swampert",
            "FRLG Charizard",
            "FRLG Blastoise",
            "FRLG Venusaur",
            "RubySapphire Swampert",
        ],
    )

    ## Getting Specific sheet
    data = datasheets[sheet_req]

    if "FRLG" in sheet_req:
        grunt_name = "Team Rocket Grunt"
        data = correct_grunt_names(data, grunt_name)

    elif "Sapphire" in sheet_req:
        grunt_name = "Team Aqua Grunt"
        data = correct_grunt_names(data, grunt_name)

    elif "Emerald" in sheet_req:
        grunt_name = "Team Aqua Grunt"
        data = correct_grunt_names(data, grunt_name)

        grunt_name = "Team Magma Grunt"
        data = correct_grunt_names(data, grunt_name)

    ## Adding new columns and setting defaults
    data["IVS"] = [{'hp': 0, 'atk': 0, 'def': 0, 'spa': 0, 'spd': 0, 'spe': 0}] * len(data)
    data["EVS"] = [{'hp': 0, 'atk': 0, 'def': 0, 'spa': 0, 'spd': 0, 'spe': 0}]* len(data)
    data["Nature"] = ["Hardy"] * len(data)

    # Removing unneccessary data
    data.drop(
        [
            "Location on Route",
            "Money",
            "HP",
            "Attack",
            "Defense",
            "Sp. Attack",
            "Sp Defense",
            "Speed",
        ],
        axis=1,
        inplace=True,
    )

    ## Giving trainer names for all rows
    for i in range(len(data["Opponent"])):
        if pd.isna(data["Opponent"][i]):
            data.loc[i, "Opponent"] = data["Opponent"][i - 1]
    
    return data



## Setting ivs for trainers from modifier

def get_ivs(iv_mod: int) -> dict[str, int]:
    """
    Calculating ivs based on IV modifier of trainer
    """
    iv = int(iv_mod * 31 / 255)
    return {"hp": iv, "atk": iv, "def": iv, "spa": iv, "spd": iv, "spe": iv}


## Accountign for multiple mons in party
def set_trainer_ivs(data: pd.DataFrame) -> pd.DataFrame:
    """
    Iterating through all trainers and setting appropriate IVs
    """
    count = 0
    for index, row in data.iterrows():
        if index != 0:
            if str(data.loc[index]["Opponent"]) == data.loc[index - 1]["Opponent"]:
                count += 1
            else:
                count = 0
        for i in list(exceptions_frlg.keys()):
            if i == str(row["Opponent"]):
                data.loc[index, ("IVS", "EVS")] = (
                    get_ivs(exceptions_frlg[i]),
                    {'hp': 0, 'atk': 0, 'def': 0, 'spa': 0, 'spd': 0, 'spe': 0},
                )
                break
        for i in list(standard_frlg.keys()):
            if i == str(row["Opponent"])[: len(i)]:
                data.loc[index, ("IVS", "EVS")] = (
                    get_ivs(standard_frlg[i]),
                    {'hp': 0, 'atk': 0, 'def': 0, 'spa': 0, 'spd': 0, 'spe': 0},
                )
                break
        for i in list(ace_frlg.keys()):
            if i == str(row["Opponent"])[: len(i)]:
                data.loc[index, ("IVS", "EVS")] = (
                    get_ivs(ace_frlg[i][count]),
                    {'hp': 0, 'atk': 0, 'def': 0, 'spa': 0, 'spd': 0, 'spe': 0},
                )
                break
    return data



## Getting Names for trainers for nature/ability calc
def get_trainer_name(trainer_title: str) -> str:
    """
    Getting trainer name from trainer title for nature and ability calculation
    """

    if "Rival" in trainer_title or "Champ" in trainer_title:
        return "TERRY"
    elif "Grunt" in trainer_title:
        return "GRUNT"
    elif "Admin" in trainer_title:
        return "ADMIN"
    elif "Goon" in trainer_title:
        return "GOON"
    elif "Leader" in trainer_title:
        return trainer_title[7:].upper()
    elif "Giovanni" in trainer_title:
        return "GIOVANNI"
    elif "Lorelei" in trainer_title:
        return "LORELEI"
    elif "Bruno" in trainer_title:
        return "BRUNO"
    elif "Agatha" in trainer_title:
        return "AGATHA"
    elif "Lance" in trainer_title:
        return "LANCE"
    for i in genders_frlg.keys():
        if i in trainer_title:
            return trainer_title[len(i) + 1 :].upper()


natures = [
    "Hardy",
    "Lonely",
    "Brave",
    "Adamant",
    "Naughty",
    "Bold",
    "Docile",
    "Relaxed",
    "Impish",
    "Lax",
    "Timid",
    "Hasty",
    "Serious",
    "Jolly",
    "Naive",
    "Modest",
    "Mild",
    "Quiet",
    "Bashful",
    "Rash",
    "Calm",
    "Gentle",
    "Sassy",
    "Careful",
    "Quirky",
]

## Get natures using names and party counter
def get_natures(trainer_title: str, name: str, mon_name: str, counter: int = 0) -> tuple[int, str, int]:
    """
    Calculating natures and ability from name, trainer gender and team
    """
    for i in genders_frlg.keys():
        if i in trainer_title:
            if isinstance(genders_frlg[i], int):
                additive = genders_frlg[i]
            else:
                additive = genders_frlg[i][name.title()]

    for char in name:
        counter += e_map[char]
    for char in mon_name:
        counter += e_map[char]

    counter *= 256
    counter += additive
    nature = natures[counter % 25]
    ability_flag = counter % 2
    counter = ((counter - additive) // 256) % 25
    return counter, nature, ability_flag


## Getting pokemon data
pokemon_info = pd.read_csv("./data/Pokemon/pokemon_data_gen3.csv")
pokemon_info["abilities"] = pokemon_info["abilities"].apply(ast.literal_eval)

def clean_value(value):
    """
    Utility function to convert nan values to None
    """
    if isinstance(value, float) and math.isnan(value):
        return None
    return value

def get_trainer_teams(trainers_data: pd.DataFrame) -> dict:
    teams = {}
    n_counter = 0
    prev_name = ""
    outliers = []
    for index, rows in trainers_data.iterrows():

        name = get_trainer_name(rows["Opponent"])
        if not name:
            continue
        if prev_name != "" and prev_name != rows["Opponent"]:
            n_counter = 0
            
        n_counter, nature, ability_flag = get_natures(
            rows["Opponent"], name, rows["Pokémon"].upper(), n_counter
        )
        prev_name = rows["Opponent"]
        mon = rows["Pokémon"]
        if mon == "Nidoran F":
            mon = "Nidoran♀"
        elif mon == "Nidoran M":
            mon = "Nidoran♂"
        elif mon == "Farfetchd":
            mon = "Farfetch'd"
        all_abilities = list(
            pokemon_info[pokemon_info["name"] == mon].iloc[:]["abilities"]
        )[0]

        for col in ["Attack 1", "Attack 2", "Attack 3", "Attack 4"]:
            misspelt = False
            for i in move_data.keys():
                if move_data[i]["name"] == rows[col]:
                    rows[col] = i
                    misspelt = True
                    break
            if not misspelt and rows[col] not in outliers:
                outliers.append(rows[col])

        # print(name, rows['Pokémon'].upper(), nature)
        poke_info = {
            "name": mon,
            "Level": int(rows["Level"]) if not math.isnan(rows["Level"]) else None,
            "Attack_1": clean_value(rows.get("Attack 1")),
            "Attack_2": clean_value(rows.get("Attack 2")),
            "Attack_3": clean_value(rows.get("Attack 3")),
            "Attack_4": clean_value(rows.get("Attack 4")),
            "IVS": ast.literal_eval(rows["IVS"]),
            "EVS": ast.literal_eval(rows["EVS"]),
            "Nature": nature,
            "Ability": all_abilities[ability_flag],
        }
        if rows["Opponent"] not in teams.keys():
            teams[rows["Opponent"]] = [poke_info]

        elif rows["Opponent"] in teams.keys():
            teams[rows["Opponent"]].append(poke_info)

    return teams


# trainers_data = pd.read_csv("FRLG Trainers.csv")

# output = get_trainer_teams(trainers_data)


# json.dump(output, open("frlg_trainers.json", "w"))


def main():

    sheet_names=[
            "Emerald Swampert",
            "FRLG Charizard",
            "FRLG Blastoise",
            "FRLG Venusaur",
            "RubySapphire Swampert",
        ]
    
    sheet_name = sheet_names[1]
    data = set_data(sheet_name)
    data = set_trainer_ivs(data)
    data.to_csv(f'data/Opponents/{sheet_name}.csv')

    trainer_data = pd.read_csv(f'data/Opponents/{sheet_name}.csv')
    trainer_teams = get_trainer_teams(trainer_data)

    with open(f"data/Opponents/{sheet_name}_teams.json", "w") as f:
        json.dump(trainer_teams, f)


main()

