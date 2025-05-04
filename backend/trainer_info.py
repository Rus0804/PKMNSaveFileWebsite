import struct
from constants import decode_gba_string

def parse_money(section, version, security_key):
    if version =='FRLG':
        address = 0x0290
    else:
        address = 0x0490
    raw_money = struct.unpack('<I', section[address:address+4])[0]
    return raw_money ^ security_key


def parse_trainer_info(section):
    name = decode_gba_string(section[0x0000:0x0007])
    gender_byte = section[0x0008]
    trainer_id, secret_id = struct.unpack('<HH', section[0x000A:0x000E])
    gender = 'Male' if gender_byte == 0 else 'Female'

    return {
        "name": name,
        "trainer_id": trainer_id,
        "secret_id": secret_id,
        "gender": gender,
    }