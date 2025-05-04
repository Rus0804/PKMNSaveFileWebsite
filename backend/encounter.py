import pandas as pd
import os
from constants import *

def load_encounter_data(encounter_data):
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
    return encounter_data
            
