

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
