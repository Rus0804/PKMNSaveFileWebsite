import struct
from constants import *
from maps import *
from get_stats import *
import math

def get_substructure_order(personality):
    return SUBSTRUCTURE_ORDERS[personality % 24]

def correct_species_id(species_id):
    return Hoen_mon_map[species_id]

def decrypt_pokemon(pkmn_data, pc = False):
    personality = struct.unpack('<I', pkmn_data[0x00:0x04])[0]
    ot_id = struct.unpack('<I', pkmn_data[0x04:0x08])[0]
    key = personality ^ ot_id

    p1 = personality//65536
    p2 = personality%65536
    t_id, s_id = struct.unpack('<HH', pkmn_data[0x04:0x08])
    isShiny = (p1 ^ p2 ^ t_id ^ s_id) < 8

    encrypted = pkmn_data[0x20:0x20+48]
    decrypted = bytearray()
    for i in range(0, 48, 4):
        value = struct.unpack('<I', encrypted[i:i+4])[0]
        decrypted_value = value ^ key
        decrypted += struct.pack('<I', decrypted_value)

    blocks = [decrypted[i*12:(i+1)*12] for i in range(4)]
    block_map = dict(zip('GAEM', []*4))
    order = get_substructure_order(personality)
    for i, code in enumerate(order):
        block_map[code] = blocks[i]

    growth = block_map['G']
    ev_cond = block_map['E']
    misc = block_map['M']
    attacks = block_map['A']

    pokedex_num = struct.unpack('<H', growth[0x00:0x02])[0]
    if pokedex_num> 276:
        pokedex_num = correct_species_id(pokedex_num)
    
    held_item = struct.unpack('<H', growth[0x02:0x04])[0]

    friendship = growth[0x09]
    
    nature = Natures[personality%25]
    nickname = decode_gba_string(pkmn_data[0x08:0x08+10])

    ivs, evs, ability = get_hidden_stats(ev_cond, misc, pokedex_num)
    
    moves = {
             0:struct.unpack('<H', attacks[0x00:0x02])[0],
             1:struct.unpack('<H', attacks[0x02:0x04])[0],
             2:struct.unpack('<H', attacks[0x04:0x06])[0],
             3:struct.unpack('<H', attacks[0x06:0x08])[0]
             }

    check = 0
    stats = ['hp', 'atk', 'def', 'spe', 'spa', 'spd']
    for i in range(len(stats)):
        check += ivs[stats[i]]%2 * (2**i)
        type_check = check * 15/63
        type_check = int(type_check)
        hidden_power_type = ['Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark'][type_check] 
        hidden_power_power = int(check * 40/63 + 30)

    if pc:
        exp_grps = list(experience_group.keys())
        level = 0
        for group in exp_grps:
            if pokedex_num in experience_group[group]:
                experience = struct.unpack('<I', growth[0x00+4:0x00+8])[0]
                for lvl in range(101):
                    if experience<experience_group_levels[group][lvl]:
                        level = lvl-1
                        break
                break
        
    else:
        level = pkmn_data[0x54]  # unencrypted level


    stats = get_stats(ivs, evs, nature, pokedex_num, level)
    types = [
        str(pokemon_info[pokemon_info["pokedex_number"]==pokedex_num]['type1'].values[0]),
        str(pokemon_info[pokemon_info["pokedex_number"]==pokedex_num]['type2'].values[0])
    ]
    pokemon_data = {
            "personality": personality,
            "pokedex_num": pokedex_num,
            "species_id": speciesMap[pokedex_num]['Species'],
            "name": speciesMap[pokedex_num]['Name'],
            "nickname":nickname,
            "type1": types[0],
            "type2": types[1],
            "nature": nature,
            "held_item": held_item,
            "level": level,
            "moves": moves,
            "evs" : evs,
            "ivs": ivs,
            "stats": stats,
            "ability": ability,
            "shiny": isShiny,
            "friendship": friendship,
            "hidden_power": [hidden_power_type, hidden_power_power]
        }
    return pokemon_data

def parse_party_pokemon(section, version):
    adder = 0
    if version != 'FRLG':
        adder = 0x0200
    party_count = section[0x0034+adder]
    pokemon_data = []

    for i in range(party_count):
        offset = 0x0038 + i * 100 + adder
        pkmn_raw = section[offset:offset+100]
        decrypted = decrypt_pokemon(pkmn_raw)
        pokemon_data.append({
            "index": i + 1,
            "pokedex_num": decrypted['pokedex_num'],
            "species_id": decrypted['species_id'],
            "nickname": decrypted['nickname'],
            "name": decrypted['name'],
            "nature":decrypted['nature'],
            "type1": decrypted['type1'],
            "type2": decrypted['type2'],
            "held_item": decrypted['held_item'],
            "level": decrypted['level'],
            "name": decrypted['name'],
            "moves": decrypted['moves'],
            "evs": decrypted['evs'],
            "ivs": decrypted['ivs'],
            "ability": decrypted['ability'],
            "stats": decrypted['stats'],
            "shiny": decrypted['shiny'],
            "friendship": decrypted['friendship'],
            "hidden_power": decrypted['hidden_power'],
            "personality": decrypted['personality'],
            "alive": True,
            "badges": [False, False, False, False, False, False, False, False]     
        })
    return pokemon_data

def get_pc_buffer(data, save_offset):
    buffer = bytearray()
    for section_id in range(5, 14):
        section = read_section(data, save_offset, section_id)
        if section_id == 13:
            buffer += section[:2000]
        else:
            buffer += section[:3968]
    return buffer

def parse_pc_pokemon(buffer):
    boxes = {i+1: [] for i in range(14)}

    for i in range(420):
        offset = 0x0004 + (i * 80)
        entry = buffer[offset:offset + 80]
        if all(b == 0x00 for b in entry):
            continue
        decrypted = decrypt_pokemon(entry, True)
        box_index = (i // 30) + 1
        slot_index = (i % 30) + 1
        boxes[box_index].append({
            "slot": slot_index,
            "pokedex_num": decrypted['pokedex_num'],
            "species_id": decrypted['species_id'],
            "name": decrypted['name'],
            "nickname": decrypted['nickname'],
            "type1": decrypted['type1'],
            "type2": decrypted['type2'],
            "nature":decrypted['nature'],
            "held_item": decrypted['held_item'],
            "level": decrypted['level'],
            "name": decrypted['name'],
            "moves": decrypted['moves'],
            "evs": decrypted['evs'],
            "ivs": decrypted['ivs'],
            "ability": decrypted['ability'],
            "stats": decrypted['stats'],
            "shiny": decrypted['shiny'],
            "friendship": decrypted['friendship'],
            "hidden_power": decrypted['hidden_power'],
            "personality": decrypted['personality'],
            "alive": True,
            "badges": [False, False, False, False, False, False, False, False] 
        })
    return boxes

def get_mon_dict(data):
    mon_dict = {mon['personality']:mon for mon in data['party']}
    for box in (data['pc'].keys()):
        if len(data['pc'][box]) > 0:
            for mon in data['pc'][box]:
                mon_dict[mon['personality']] = mon
    return mon_dict

def update_pokemon(old_dict, new_dict):
    for mon in old_dict.keys():
        if mon in new_dict.keys():
            new_dict[mon]['badges'] = old_dict[mon]['badges']
            new_dict[mon]['alive'] = old_dict[mon]['alive']
    return new_dict