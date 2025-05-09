from text_Decode import d_map

#for reading the sav file
NUM_BLOCKS = 14
BLOCK_SIZE = 0x1000
SAVE_A_OFFSET = 0x00000
SAVE_B_OFFSET = 0x10000

SECTION_TRAINER_INFO = 0
SECTION_TEAM_ITEMS = 1
SECTION_ID = 13

SUBSTRUCTURE_ORDERS = [
    'GAEM', 'GAME', 'GEAM', 'GEMA', 'GMAE', 'GMEA',
    'AGEM', 'AGME', 'AEGM', 'AEMG', 'AMGE', 'AMEG',
    'EGAM', 'EGMA', 'EAGM', 'EAMG', 'EMGA', 'EMAG',
    'MGAE', 'MGEA', 'MAGE', 'MAEG', 'MEGA', 'MEAG'
]

#for pokemon info
Natures = ["Hardy","Lonely","Brave","Adamant","Naughty","Bold","Docile","Relaxed","Impish",	"Lax","Timid","Hasty","Serious","Jolly","Naive","Modest","Mild","Quiet","Bashful","Rash","Calm","Gentle","Sassy","Careful","Quirky"]

NATURE_MODIFIERS = {
    "hardy":     {},
    "lonely":    {"atk": 1.1, "def": 0.9},
    "brave":     {"atk": 1.1, "spe": 0.9},
    "adamant":   {"atk": 1.1, "spa": 0.9},
    "naughty":   {"atk": 1.1, "spd": 0.9},

    "bold":      {"def": 1.1, "atk": 0.9},
    "docile":    {},
    "relaxed":   {"def": 1.1, "spe": 0.9},
    "impish":    {"def": 1.1, "spa": 0.9},
    "lax":       {"def": 1.1, "spd": 0.9},

    "timid":     {"spe": 1.1, "atk": 0.9},
    "hasty":     {"spe": 1.1, "def": 0.9},
    "serious":   {},
    "jolly":     {"spe": 1.1, "spa": 0.9},
    "naive":     {"spe": 1.1, "spd": 0.9},

    "modest":    {"spa": 1.1, "atk": 0.9},
    "mild":      {"spa": 1.1, "def": 0.9},
    "quiet":     {"spa": 1.1, "spe": 0.9},
    "bashful":   {},
    "rash":      {"spa": 1.1, "spd": 0.9},

    "calm":      {"spd": 1.1, "atk": 0.9},
    "gentle":    {"spd": 1.1, "def": 0.9},
    "sassy":     {"spd": 1.1, "spe": 0.9},
    "careful":   {"spd": 1.1, "spa": 0.9},
    "quirky":    {}
}



#for encounter.py
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

#for converting to text

def decode_gba_string(data):  
    decoded_string = ''.join(d_map.get(b, '?') for b in data).split('\x00')[0]
    if '$' in decoded_string:
        return decoded_string[:decoded_string.find('$')]
    else:   
        return decoded_string

def read_section(data, base_offset, section_id):
    current_section_id = -1
    for i in range(NUM_BLOCKS):
        offset = base_offset + (i * BLOCK_SIZE)        
        section_data = data[offset:offset + BLOCK_SIZE]
        current_section_id = section_data[0xFF4]
        if current_section_id == section_id:
            return section_data
    return None
