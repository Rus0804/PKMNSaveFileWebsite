from .constants import NUM_BLOCKS, BLOCK_SIZE
import json


with open("data/TextMaps/text_decoder.json", "r") as f:
    d_map = json.load(f)


def read_section(data: bytes, base_offset: int, section_id: int) -> bytes | None:
    """
    Obtaining the required sections based on the 'base_offset' and 'section_id'
    """
    current_section_id = -1
    for i in range(NUM_BLOCKS):
        offset = base_offset + (i * BLOCK_SIZE)        
        section_data = data[offset:offset + BLOCK_SIZE]
        current_section_id = section_data[0xFF4]
        if current_section_id == section_id:
            return section_data
    return None


def decode_gba_string(data: bytes) -> str:
    """
    Read the data and return the decoded string
    """  
    decoded_string = ''.join(d_map.get(b, '?') for b in data).split('\x00')[0]
    if '$' in decoded_string:
        return decoded_string[:decoded_string.find('$')]
    else:   
        return decoded_string
