import pandas as pd
from backend.data.Pokemon.move_data import move_data
from backend.data.Opponents.frlg_trainer_genders import genders_frlg
from backend.data.Opponents.frlg_trainer_ivs import *
import ast
import json
from backend.get_data.text_decode import d_map

## Read source sheet
def set_data(sheet_req):
    datasheets = pd.read_excel(
        "data/Pokemon Gen 3 Trainers DataSheet.xlsx",
        sheet_name=[
            "Emerald Swampert",
            "FRLG Charizard",
            "FRLG Blastoise",
            "FRLG Venusaur",
            "RubySapphire Swampert",
        ],
    )
    sheet_names = list(datasheets.keys())

    ## Getting Specific sheet
    data = datasheets[sheet_names[sheet_req]]

    ## Adding new columns and setting defaults
    data["IVS"] = [{"hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0}] * len(data)
    data["EVS"] = [{"hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0}] * len(data)
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

    
    return data, sheet_names[sheet_req]



## Setting ivs for trainers from modifier

def get_ivs(iv_mod):
    iv = int(iv_mod * 31 / 255)
    return {"hp": iv, "atk": iv, "def": iv, "spa": iv, "spd": iv, "spe": iv}


## Accountign for multiple mons in party
def set_trainer_ivs(data):
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
                    {"hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0},
                )
                break
        for i in list(standard_frlg.keys()):
            if i == str(row["Opponent"])[: len(i)]:
                data.loc[index, ("IVS", "EVS")] = (
                    get_ivs(standard_frlg[i]),
                    {"hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0},
                )
                break
        for i in list(ace_frlg.keys()):
            if i == str(row["Opponent"])[: len(i)]:
                data.loc[index, ("IVS", "EVS")] = (
                    get_ivs(ace_frlg[i][count]),
                    {"hp": 0, "atk": 0, "def": 0, "spa": 0, "spd": 0, "spe": 0},
                )
                break
    return data



## Getting Names for trainers for nature/ability calc
def get_trainer_name(trainer_title):
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
def get_natures(trainer_title, name, mon, counter=0):
    for i in genders_frlg.keys():
        if i in trainer_title:
            if isinstance(genders_frlg[i], int):
                additive = genders_frlg[i]
            else:
                additive = genders_frlg[i][name.title()]

    for char in name:
        counter += d_map[char]
    for char in mon:
        counter += d_map[char]

    counter *= 256
    counter += additive
    nature = natures[counter % 25]
    ability_flag = counter % 2
    counter = ((counter - additive) // 256) % 25
    return counter, nature, ability_flag


## Getting pokemon data
pokemon_info = pd.read_csv("data/pokemon_data_gen3.csv")
pokemon_info["abilities"] = pokemon_info["abilities"].apply(ast.literal_eval)


## Set as JSON
def get_trainer_teams(trainers_data):
    teams = {}
    n_counter = 0
    prev_name = ""
    outliers = []
    for index, rows in trainers_data.iterrows():
        name = get_trainer_name(rows["Opponent"])
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
        poke_info = dict(rows.drop(["Opponent", "Route"]))
        poke_info["IVS"] = json.loads(poke_info["IVS"])
        poke_info["EVS"] = json.loads(poke_info["EVS"])
        poke_info["Nature"] = nature
        poke_info["Ability"] = all_abilities[ability_flag]

        if rows["Opponent"] not in teams.keys():
            teams[rows["Opponent"]] = [poke_info]

        elif rows["Opponent"] in teams.keys():
            teams[rows["Opponent"]].append(poke_info)

    print(outliers)
    return teams


# trainers_data = pd.read_csv("FRLG Trainers.csv")

# output = get_trainer_teams(trainers_data)


# json.dump(output, open("frlg_trainers.json", "w"))


def main():
    data, sheet_name = set_data(1)
    data = set_trainer_ivs(data)
    data.to_csv(f'data/{sheet_name}.csv')

    trainer_data = pd.read_csv(f'data/{sheet_name}.csv')


main()

