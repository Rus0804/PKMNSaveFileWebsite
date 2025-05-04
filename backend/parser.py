import struct
from trainer_info import *
from pokemon_info import *
from constants import *


def get_save_index(section_data):
    return struct.unpack('<I', section_data[0x0C:0x10])[0]

def get_security_key(section, version):
    if version == "FRLG":
        return struct.unpack('<I', section[0x0AF8:0x0AFC])[0]
    else:
        return struct.unpack('<I', section[0x00AC:0x00AC+4])[0]

def detect_gen3_game_version(save_bytes: bytes) -> str:
    section_0_offset = 0x0000  # section 0 starts at the beginning
    value = struct.unpack('<I', save_bytes[section_0_offset + 0xAC : section_0_offset + 0xAC + 4])[0]

    if value == 0x00000001:
        return "FRLG"
    else:
        return "RSE"

def parse_save_file(data: bytes):    
    section_13_a = read_section(data, SAVE_A_OFFSET, SECTION_ID)
    section_13_b = read_section(data, SAVE_B_OFFSET, SECTION_ID)

    if not section_13_a or not section_13_b:
        print("Error: Could not find section 13 in one or both save blocks.")
        if section_13_a:
            index_a = get_save_index(section_13_a)
            index_b = 0
        elif section_13_b:
            index_b = get_save_index(section_13_b)
            index_a = 0
        else:
            print('Error: Could not find section 13 in both save blocks')
            print(section_13_a)
            return "SaveFileError"
    else:
        index_a = get_save_index(section_13_a)
        index_b = get_save_index(section_13_b)

    if index_a < index_b:
        save_offset = SAVE_B_OFFSET
        print(f"✅ Using Save Block A (index {index_b})")
    else:
        save_offset = SAVE_A_OFFSET
        print(f"✅ Using Save Block B (index {index_a})")

    trainer_section = read_section(data, save_offset, SECTION_TRAINER_INFO)
    ver = detect_gen3_game_version(trainer_section)
    items_section = read_section(data, save_offset, SECTION_TEAM_ITEMS)
    trainer = parse_trainer_info(trainer_section)
    security_key = get_security_key(trainer_section, ver)
    money = parse_money(items_section, ver, security_key)
    
    party = parse_party_pokemon(items_section, ver)
    pc_buffer = get_pc_buffer(data, save_offset)
    pc_data = parse_pc_pokemon(pc_buffer)

    return {
        "trainer": trainer,
        "money": money,
        "party": party,
        "pc": pc_data,
        "version": ver
    }
