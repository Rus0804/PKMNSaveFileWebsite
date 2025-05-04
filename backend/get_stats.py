import struct
from constants import *
from maps import *

def get_hidden_stats(ev_data, iv_data, pokedex_num):
    evs = {'hp': ev_data[0x00], 'atk': ev_data[0x01], 'def': ev_data[0x02], 'spa': ev_data[0x04], 'spd': ev_data[0x05], 'spe': ev_data[0x03]}
    iv_word = struct.unpack('<I', iv_data[4:8])[0]  # 4 bytes

    ivs = {
        'hp':   (iv_word >> 0)  & 0b11111,
        'atk':  (iv_word >> 5)  & 0b11111,
        'def':  (iv_word >> 10) & 0b11111,
        'spa':  (iv_word >> 20) & 0b11111,
        'spd':  (iv_word >> 25) & 0b11111,
        'spe':  (iv_word >> 15) & 0b11111
    }
    ability_flag = (iv_word >> 31) & 0b1

    all_abilities = pokemon_info[pokemon_info['pokedex_number']==pokedex_num].iloc[0]['abilities']

    ability = all_abilities[ability_flag]

    return ivs, evs, ability

def get_nature_modifiers(nature: str) -> dict:
    modifiers = {"atk": 1.0, "def": 1.0, "spa": 1.0, "spd": 1.0, "spe": 1.0}
    if nature.lower() in NATURE_MODIFIERS:
        for stat, factor in NATURE_MODIFIERS[nature.lower()].items():
            modifiers[stat] = factor
    return modifiers

def get_stats(ivs, evs, nature, pokedex_num, level):

    species_info = pokemon_info[pokemon_info['pokedex_number']==pokedex_num]

    base = {
            'hp': species_info['hp'], 
            'atk': species_info['attack'],
            'def': species_info['defense'], 
            'spa': species_info['sp_attack'], 
            'spd': species_info['sp_defense'], 
            'spe': species_info['speed']
            }
    
    nature_mod = get_nature_modifiers(nature)

    stats = {}

    stats["hp"] = (
        ((2 * base["hp"] + ivs["hp"] + (evs["hp"] // 4)) * level) // 100
    ) + level + 10
    stats["hp"] = int(stats["hp"].iloc[0])

    for stat in ["atk", "def", "spa", "spd", "spe"]:
        base_val = ((2 * base[stat] + ivs[stat] + (evs[stat] // 4)) * level) // 100 + 5
        stats[stat] = base_val * nature_mod[stat]
        stats[stat] = int(stats[stat].iloc[0])

    return stats