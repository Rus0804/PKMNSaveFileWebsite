from collections import defaultdict
from constants import *
import pandas as pd
import ast

speciesMap = {
  #Gen1
  1:  {'Name':'Bulbasaur', 'Species':1},  2: {'Name':'Ivysaur','Species':1},  3: {'Name':'Venusaur','Species':1},
  4:  {'Name':'Charmander','Species':2},  5: {'Name':'Charmeleon','Species':2},  6: {'Name':'Charizard','Species':2},
  7:  {'Name':'Squirtle','Species':3},  8: {'Name':'Wartortle','Species':3},  9: {'Name':'Blastoise','Species':3},
  10: {'Name':'Caterpie','Species':4},  11: {'Name':'Metapod','Species':4},  12: {'Name':'Butterfree','Species':4},
  13: {'Name':'Weedle','Species':5},  14: {'Name':'Kakuna','Species':5},  15: {'Name':'Beedrill','Species':5},
  16: {'Name':'Pidgey','Species':6},  17: {'Name':'Pidgeotto','Species':6},  18: {'Name':'Pidgeot','Species':6},
  19: {'Name':'Rattata','Species':7},  20: {'Name':'Raticate','Species':7},
  21: {'Name':'Spearow','Species':8},  22: {'Name':'Fearow','Species':8},
  23: {'Name':'Ekans','Species':9},  24: {'Name':'Arbok','Species':9},
  25: {'Name':'Pikachu','Species':10},  26: {'Name':'Raichu','Species':10},
  27: {'Name':'Sandshrew','Species':11},  28: {'Name':'Sandslash','Species':11},
  29: {'Name':'Nidoran♀','Species':12},  30: {'Name':'Nidorina','Species':12},  31: {'Name':'Nidoqueen','Species':12},
  32: {'Name':'Nidoran♂','Species':13},  33: {'Name':'Nidorino','Species':13},  34: {'Name':'Nidoking','Species':13},
  35: {'Name':'Clefairy','Species':14},  36: {'Name':'Clefable','Species':14},
  37: {'Name':'Vulpix','Species':15},  38: {'Name':'Ninetales','Species':15},
  39: {'Name':'Jigglypuff','Species':16},  40: {'Name':'Wigglytuff','Species':16},
  41: {'Name':'Zubat','Species':17},  42: {'Name':'Golbat','Species':17},
  43: {'Name':'Oddish','Species':18},  44: {'Name':'Gloom','Species':18},  45: {'Name':'Vileplume','Species':18},
  46: {'Name':'Paras','Species':19},  47: {'Name':'Parasect','Species':19},
  48: {'Name':'Venonat','Species':20},  49: {'Name':'Venomoth','Species':20},
  50: {'Name':'Diglett','Species':21},  51: {'Name':'Dugtrio','Species':21},
  52: {'Name':'Meowth','Species':22},  53: {'Name':'Persian','Species':22},
  54: {'Name':'Psyduck','Species':23},  55: {'Name':'Golduck','Species':23},
  56: {'Name':'Mankey','Species':24},  57: {'Name':'Primeape','Species':24},
  58: {'Name':'Growlithe','Species':25},  59: {'Name':'Arcanine','Species':25},
  60: {'Name':'Poliwag','Species':26},  61: {'Name':'Poliwhirl','Species':26},  62: {'Name':'Poliwrath','Species':26},
  63: {'Name':'Abra','Species':27},  64: {'Name':'Kadabra','Species':27},  65: {'Name':'Alakazam','Species':27},
  66: {'Name':'Machop','Species':28},  67: {'Name':'Machoke','Species':28},  68: {'Name':'Machamp','Species':28},
  69: {'Name':'Bellsprout','Species':29},  70: {'Name':'Weepinbell','Species':29},  71: {'Name':'Victreebel','Species':29},
  72: {'Name':'Tentacool','Species':30},  73: {'Name':'Tentacruel','Species':30},
  74: {'Name':'Geodude','Species':31},  75: {'Name':'Graveler','Species':31},  76: {'Name':'Golem','Species':31},
  77: {'Name':'Ponyta','Species':32},  78: {'Name':'Rapidash','Species':32},
  79: {'Name':'Slowpoke','Species':33},  80: {'Name':'Slowbro','Species':33},
  81: {'Name':'Magnemite','Species':34},  82: {'Name':'Magneton','Species':34},
  83: {'Name':"Farfetch'd",'Species':35},
  84: {'Name':'Doduo','Species':36},  85: {'Name':'Dodrio','Species':36},
  86: {'Name':'Seel','Species':37},  87: {'Name':'Dewgong','Species':37},
  88: {'Name':'Grimer','Species':38},  89: {'Name':'Muk','Species':38},
  90: {'Name':'Shellder','Species':39},  91: {'Name':'Cloyster','Species':39},
  92: {'Name':'Gastly','Species':40},  93: {'Name':'Haunter','Species':40},  94: {'Name':'Gengar','Species':40},
  95: {'Name':'Onix','Species':41},
  96: {'Name':'Drowzee','Species':42},  97: {'Name':'Hypno','Species':42},
  98: {'Name':'Krabby','Species':43},  99: {'Name':'Kingler','Species':43},
  100: {'Name':'Voltorb','Species':44},  101: {'Name':'Electrode','Species':44},
  102: {'Name':'Exeggcute','Species':45},  103: {'Name':'Exeggutor','Species':45},
  104: {'Name':'Cubone','Species':46},  105: {'Name':'Marowak','Species':46},
  106: {'Name':'Hitmonlee','Species':47},  107: {'Name':'Hitmonchan','Species':47},
  108: {'Name':'Lickitung','Species':48},
  109: {'Name':'Koffing','Species':49},  110: {'Name':'Weezing','Species':49},
  111: {'Name':'Rhyhorn','Species':50},  112: {'Name':'Rhydon','Species':50},
  113: {'Name':'Chansey','Species':51},
  114: {'Name':'Tangela','Species':52},
  115: {'Name':'Kangaskhan','Species':53},
  116: {'Name':'Horsea','Species':54},  117: {'Name':'Seadra','Species':54},
  118: {'Name':'Goldeen','Species':55},  119: {'Name':'Seaking','Species':55},
  120: {'Name':'Staryu','Species':56},  121: {'Name':'Starmie','Species':56},
  122: {'Name':'Mr. Mime','Species':57},
  123: {'Name':'Scyther','Species':58},
  124: {'Name':'Jynx','Species':59},
  125: {'Name':'Electabuzz','Species':60},
  126: {'Name':'Magmar','Species':61},
  127: {'Name':'Pinsir','Species':62},
  128: {'Name':'Tauros','Species':63},
  129: {'Name':'Magikarp','Species':64},  130: {'Name':'Gyarados','Species':64},
  131: {'Name':'Lapras','Species':65},
  132: {'Name':'Ditto','Species':65},
  133: {'Name':'Eevee','Species':66},  134: {'Name':'Vaporeon','Species':66},  135: {'Name':'Jolteon','Species':66},  136: {'Name':'Flareon','Species':66},
  137: {'Name':'Porygon','Species':67},
  138: {'Name':'Omanyte','Species':68},  139: {'Name':'Omastar','Species':68},
  140: {'Name':'Kabuto','Species':69},  141: {'Name':'Kabutops','Species':69},
  142: {'Name':'Aerodactyl','Species':70},
  143: {'Name':'Snorlax','Species':71},
  144: {'Name':'Articuno','Species':72},
  145: {'Name':'Zapdos','Species':73},
  146: {'Name':'Moltres','Species':74},
  147: {'Name':'Dratini','Species':75},  148: {'Name':'Dragonair','Species':75},  149: {'Name':'Dragonite','Species':75},
  150: {'Name':'Mewtwo','Species':76},
  151: {'Name':'Mew','Species':77},

  #Gen2
  152: {'Name':'Chikorita','Species':78},  153: {'Name':'Bayleaf','Species':78},  154: {'Name':'Meganium','Species':78},
  155: {'Name':'Cyndaquil','Species':79},  156: {'Name':'Quilava','Species':79},  157: {'Name':'Typhlosion','Species':79},
  158: {'Name':'Totodile','Species':80},  159: {'Name':'Croconaw','Species':80},  160: {'Name':'Feraligatr','Species':80},
  161: {'Name':'Sentret','Species':81},  162: {'Name':'Furret','Species':81},
  163: {'Name':'Hoothoot','Species':82},  164: {'Name':'Noctowl','Species':82},
  165: {'Name':'Ledyba','Species':83},  166: {'Name':'Ledian','Species':83},
  167: {'Name':'Spinarak','Species':84},  168: {'Name':'Ariados','Species':84},
  169: {'Name':'Crobat','Species':17},
  170: {'Name':'Chinchou','Species':85},  171: {'Name':'Lanturn','Species':85},
  172: {'Name':'Pichu','Species':10},
  173: {'Name':'Cleffa','Species':14},
  174: {'Name':'Igglybuff','Species':16},
  175: {'Name':'Togepi','Species':86},  176: {'Name':'Togetic','Species':86},
  177: {'Name':'Natu','Species':87},  178: {'Name':'Xatu','Species':87},
  179: {'Name':'Mareep','Species':88},  180: {'Name':'Flaaffy','Species':88},  181: {'Name':'Ampharos','Species':88},
  182: {'Name':'Bellossom','Species':18},
  183: {'Name':'Marill','Species':89},  184: {'Name':'Azumarill','Species':89},
  185: {'Name':'Sudowoodo','Species':90},
  186: {'Name':'Politoad','Species':26},
  187: {'Name':'Hoppip','Species':91},  188: {'Name':'Skiploom','Species':91},  189: {'Name':'Jumpluff','Species':91},
  190: {'Name':'Aipom','Species':92},
  191: {'Name':'Sunkern','Species':92},  192: {'Name':'Sunflora','Species':92},
  193: {'Name':'Yanma','Species':93},
  194: {'Name':'Wooper','Species':94},  195: {'Name':'Quagsire','Species':94},
  196: {'Name':'Espeon','Species':66},  197: {'Name':'Umbreon','Species':66},
  198: {'Name':'Murkrow','Species':95},
  199: {'Name':'Slowking','Species':33},
  200: {'Name':'Misdreavus','Species':96},
  201: {'Name':'Unown','Species':97},
  202: {'Name':'Wobbuffet','Species':98},
  203: {'Name':'Girafarig','Species':99},
  204: {'Name':'Pineco','Species':100},  205: {'Name':'Forretress','Species':100},
  206: {'Name':'Dunsparce','Species':101},
  207: {'Name':'Gligar','Species':102},
  208: {'Name':'Steelix','Species':41},
  209: {'Name':'Snubbull','Species':103},  210: {'Name':'Granbull','Species':103},
  211: {'Name':'Qwilfish','Species':104},
  212: {'Name':'Scizor','Species':58},
  213: {'Name':'Shuckle','Species':105},
  214: {'Name':'Heracross','Species':106},
  215: {'Name':'Sneasel','Species':107},
  216: {'Name':'Teddiursa','Species':108},  217: {'Name':'Ursaring','Species':108},
  218: {'Name':'Slugma','Species':109},  219: {'Name':'Magcargo','Species':109},
  220: {'Name':'Swinub','Species':110},  221: {'Name':'Piloswine','Species':110},
  222: {'Name':'Corsola','Species':111},
  223: {'Name':'Remoraid','Species':112},  224: {'Name':'Octillery','Species':112},
  225: {'Name':'Delibird','Species':113},
  226: {'Name':'Mantine','Species':114},
  227: {'Name':'Skarmory','Species':115},
  228: {'Name':'Houndour','Species':116},  229: {'Name':'Houndoom','Species':116},
  230: {'Name':'Kingdra','Species':54},
  231: {'Name':'Phanpy','Species':117},  232: {'Name':'Donphan','Species':117},
  233: {'Name':'Porygon2','Species':67},
  234: {'Name':'Stantler','Species':118},
  235: {'Name':'Smeargle','Species':119},
  236: {'Name':'Tyrogue','Species':47},  237: {'Name':'Hitmontop','Species':47},
  238: {'Name':'Smoochum','Species':59},
  239: {'Name':'Elekid','Species':60},
  240: {'Name':'Magby','Species':61},
  241: {'Name':'Miltank','Species':120},
  242: {'Name':'Blissey','Species':51},
  243: {'Name':'Raikou','Species':121},
  244: {'Name':'Entei','Species':122},
  245: {'Name':'Suicune','Species':123},
  246: {'Name':'Larvitar','Species':124},  247: {'Name':'Pupitar','Species':124},  248: {'Name':'Tyranitar','Species':124},
  249: {'Name':'Lugia','Species':125},
  250: {'Name':'Ho-oh','Species':126},
  251: {'Name':'Celebi','Species':127},

  #Gen3
  252: {'Name':'Treeko','Species':128},  253: {'Name':'Grovyle','Species':128},  254: {'Name':'Sceptile','Species':128},
  255: {'Name':'Torchic','Species':129},  256: {'Name':'Combusken','Species':129},  257: {'Name':'Blaziken','Species':129},
  258: {'Name':'Mudkip','Species':130},  259: {'Name':'Marshtomp','Species':130},  260: {'Name':'Swampert','Species':130},
  261: {'Name':'Poochyena','Species':131},  262: {'Name':'Mightyena','Species':131},
  263: {'Name':'Zigzagoon','Species':132},  264: {'Name':'Linoone','Species':132},
  265: {'Name':'Wurmple','Species':133},  266: {'Name':'Silcoon','Species':134},  267: {'Name':'Beautifly','Species':134},
  268: {'Name':"Cascoon",'Species':135},  269: {'Name':'Dustox','Species':135},
  270: {'Name':'Lotad','Species':136},  271: {'Name':'Lombre','Species':136},  272: {'Name':'Ludicolo','Species':136},
  273: {'Name':"Seedot",'Species':137},  274: {'Name':"Nuzleaf",'Species':137},  275: {'Name':"Shiftry",'Species':137},
  276: {'Name':"Taillow",'Species':138},  277: {'Name':"Swellow",'Species':138},
  278: {'Name':"Wingull",'Species':139},  279: {'Name':"Pelipper",'Species':139},
  280: {'Name':"Ralts",'Species':140},  281: {'Name':"Kirlia",'Species':140},  282: {'Name':"Gardevoir",'Species':140},
  283: {'Name':"Surskit",'Species':141},  284: {'Name':"Masquerain",'Species':141},
  285: {'Name':"Shroomish",'Species':142},  286: {'Name':"Breloom",'Species':142},
  287: {'Name':"Slakoth",'Species':143},  288: {'Name':"Vigoroth",'Species':143},  289: {'Name':"Slaking",'Species':143},
  290: {'Name':"Nincada",'Species':144},  291: {'Name':"Ninjask",'Species':144},  292: {'Name':"Shedinja",'Species':144},
  293: {'Name':"Whismur",'Species':145},  294: {'Name':"Loudred",'Species':145},  295: {'Name':"Exploud",'Species':145},
  296: {'Name':"Makuhita",'Species':146},  297: {'Name':"Hariyama",'Species':146},
  298: {'Name':"Azurill",'Species':89},
  299: {'Name':"Nosepass",'Species':147},
  300: {'Name':"Skitty",'Species':148},  301: {'Name':"Delcatty",'Species':148},
  302: {'Name':"Sableye",'Species':149},
  303: {'Name':"Mawile",'Species':150},
  304: {'Name':"Aron",'Species':151},  305: {'Name':"Lairon",'Species':151},  306: {'Name':"Aggron",'Species':151},
  307: {'Name':"Meditite",'Species':152},  308: {'Name':"Medicham",'Species':152},
  309: {'Name':"Electrike",'Species':153},  310: {'Name':"Manectric",'Species':153},
  311: {'Name':"Plusle",'Species':154},  312: {'Name':"Minun",'Species':155},
  313: {'Name':"Volbeat",'Species':156},  314: {'Name':"Illumise",'Species':156},
  315: {'Name':"Roselia",'Species':157},
  316: {'Name':"Gulpin",'Species':158},  317: {'Name':"Swalot",'Species':158},
  318: {'Name':"Carvanha",'Species':159},  319: {'Name':"Sharpedo",'Species':159},
  320: {'Name':"Wailmer",'Species':160},  321: {'Name':"Wailord",'Species':160},
  322: {'Name':"Numel",'Species':161},  323: {'Name':"Camerupt",'Species':161},
  324: {'Name':"Torkoal",'Species':162},
  325: {'Name':"Spoink",'Species':163},  326: {'Name':"Grumpig",'Species':163},
  327: {'Name':"Spinda",'Species':164},
  328: {'Name':"Trapinch",'Species':165},  329: {'Name':"Vibrava",'Species':165},  330: {'Name':"Flygon",'Species':165},
  331: {'Name':"Cacnea",'Species':166},  332: {'Name':"Cacturne",'Species':166},
  333: {'Name':"Swablu",'Species':167},  334: {'Name':"Altaria",'Species':167},
  335: {'Name':"Zangoose",'Species':168},
  336: {'Name':"Seviper",'Species':169},
  337: {'Name':"Lunatone",'Species':170},
  338: {'Name':"Solrock",'Species':171},
  339: {'Name':"Barboach",'Species':172},  340: {'Name':"Whiscash",'Species':172},
  341: {'Name':"Corphish",'Species':173},  342: {'Name':"Crawdaunt",'Species':173},
  343: {'Name':"Baltoy",'Species':174},  344: {'Name':"Claydol",'Species':174},
  345: {'Name':"Lileep",'Species':175},  346: {'Name':"Cradily",'Species':175},
  347: {'Name':"Anorith",'Species':176},  348: {'Name':"Armaldo",'Species':176},
  349: {'Name':"Feebas",'Species':177},  350: {'Name':"Milotic",'Species':177},
  351: {'Name':"Castform",'Species':178},
  352: {'Name':"Kecleon",'Species':179},
  353: {'Name':"Shuppet",'Species':180},  354: {'Name':"Banette",'Species':180},
  355: {'Name':"Duskull",'Species':181},  356: {'Name':"Dusclops",'Species':181},
  357: {'Name':"Tropius",'Species':182},
  358: {'Name':"Chimecho",'Species':183},
  359: {'Name':"Absol",'Species':184},
  360: {'Name':"Wynaut",'Species':98},
  361: {'Name':"Snorunt",'Species':185},  362: {'Name':"Glalie",'Species':185},
  363: {'Name':"Spheal",'Species':186},  364: {'Name':"Sealeo",'Species':186},  365: {'Name':"Walrein",'Species':186},
  366: {'Name':"Clamperl",'Species':187},  367: {'Name':"Huntail",'Species':187},  368: {'Name':"Gorebyss",'Species':187},
  369: {'Name':"Relicanth",'Species':188},
  370: {'Name':"Luvdisc",'Species':189},
  371: {'Name':"Bagon",'Species':190},  372: {'Name':"Shelgon",'Species':190},  373: {'Name':"Salamence",'Species':190},
  374: {'Name':"Beldum",'Species':191},  375: {'Name':"Metang",'Species':191},  376: {'Name':"Metagross",'Species':191},
  377: {'Name':"Regirock",'Species':192},
  378: {'Name':"Regice",'Species':193},
  379: {'Name':"Registeel",'Species':194},
  380: {'Name':"Latias",'Species':195},
  381: {'Name':"Latios",'Species':196},
  382: {'Name':"Kyogre",'Species':197},
  383: {'Name':"Groudon",'Species':198},
  384: {'Name':"Rayquaza",'Species':199},
  385: {'Name':"Jirachi",'Species':200},
  386: {'Name':"Deoxys",'Species':201}
}

pokemon_info = pd.read_csv('data/pokemon_data_gen3.csv')
pokemon_info['abilities'] = pokemon_info['abilities'].apply(ast.literal_eval)

Hoen_mon_map = {
    277: 252, 278: 253, 279: 254, 280: 255, 281: 256, 282: 257,
    283: 258, 284: 259, 285: 260, 286: 261, 287: 262, 288: 263,
    289: 264, 290: 265, 291: 266, 292: 267, 293: 268, 294: 269,
    295: 270, 296: 271, 297: 272, 298: 273, 299: 274, 300: 275,
    301: 290, 302: 291, 303: 292, 304: 276, 305: 277, 306: 285,
    307: 286, 308: 327, 309: 278, 310: 279, 311: 283, 312: 284,
    313: 320, 314: 321, 315: 300, 316: 301, 317: 352, 318: 343,
    319: 344, 320: 299, 321: 324, 322: 302, 323: 339, 324: 340,
    325: 370, 326: 341, 327: 342, 328: 349, 329: 350, 330: 318,
    331: 319, 332: 328, 333: 329, 334: 330, 335: 296, 336: 297,
    337: 309, 338: 310, 339: 322, 340: 323, 341: 363, 342: 364,
    343: 365, 344: 331, 345: 332, 346: 361, 347: 362, 348: 337,
    349: 338, 350: 298, 351: 325, 352: 326, 353: 311, 354: 312,
    355: 303, 356: 307, 357: 308, 358: 333, 359: 334, 360: 360,
    361: 355, 362: 356, 363: 315, 364: 287, 365: 288, 366: 289,
    367: 316, 368: 317, 369: 357, 370: 293, 371: 294, 372: 295,
    373: 366, 374: 367, 375: 368, 376: 359, 377: 353, 378: 354,
    379: 336, 380: 335, 381: 369, 382: 304, 383: 305, 384: 306,
    385: 351, 386: 313, 387: 314, 388: 345, 389: 346, 390: 347,
    391: 348, 392: 280, 393: 281, 394: 282, 395: 371, 396: 372,
    397: 373, 398: 374, 399: 375, 400: 376, 401: 377, 402: 378,
    403: 379, 404: 382, 405: 383, 406: 384, 407: 380, 408: 381,
    409: 385, 410: 386, 411: 358,
}

experience_group = {
    "MediumFast": [10,11,12,13,14,15,
                   19,20,21,22,23,24,
                   25,26,27,28,37,38,
                   41,42,46,47,48,49,
                   50,51,52,53,54,55,
                   56,57,77,78,79,80,
                   81,82,84,85,86,87,
                   88,89,95,96,97,98,
                   99,100,101,104,105,106,
                   107,108,109,110,114,115,
                   116,117,118,119,122,123,
                   124,125,126,132,133,134,
                   135,136,137,138,139,140,
                   141,161,162,163,164,169,
                   172,177,178,185,193,194,
                   195,196,197,199,201,202,
                   203,204,205,206,208,211,
                   212,216,217,218,219,223,
                   224,230,231,232,233,236,
                   237,238,239,240,261,262,
                   263,264,265,266,267,268,
                   269,278,279,283,284,299,
                   307,308,311,312,322,323,
                   324,339,340,343,344,351,
                   360,361,362],
    "MediumSlow": [1,2,3,4,5,6,
                   7,8,9,16,17,18,
                   29,30,31,32,33,34,
                   43,44,45,60,61,62,
                   63,64,65,66,67,68,
                   69,70,71,74,75,76,
                   92,93,94,151,152,153,
                   154,155,156,157,158,159,
                   160,179,180,181,182,186,
                   187,188,189,191,192,198,
                   207,213,215,251,252,253,
                   254,255,256,257,258,259,
                   260,270,271,272,273,274,
                   275,276,277,293,294,295,
                   302,315,328,329,330,331,
                   332,352,359,363,364,365],
    "Erratic": [290,291,292,313,333,334,
                335,345,346,347,348,349,
                350,366,367,368],
    "Fluctuating": [285,286,296,297,314,316,
                    317,320,321,336,341,342,],
    "Fast": [35,36,39,40,113,165,
             166,167,168,173,174,175,
             176,183,184,190,200,209,
             210,222,225,235,242,298,
             300,301,303,325,326,327,
             337,338,353,354,355,356,
             358,370],
    "Slow": [58,59,72,73,90,91,
             102,103,111,112,120,121,
             127,128,129,130,131,142,
             143,144,145,146,147,148,
             149,150,170,171,214,220,
             221,226,227,228,229,234,
             241,243,244,245,246,247,
             248,249,250,280,281,282,
             287,288,289,304,305,306,
             309,310,318,319,357,369,
             371,372,373,374,375,376,
             377,378,379,380,381,382,
             383,384,385,386]
}

experience_group_levels = {
    "Erratic": [0,15,52,122,237,406,637,942,1326,1800,
                2369,3041,3822,4719,5737,6881,8155,9564,11111,12800,
                14632,16610,18737,21012,23437,26012,28737,31610,34632,
                37800,41111,44564,48155,51881,55737,59719,63822,72369,
                76800,81326,85942,90637,95406,100237,105122,110052,115015,120001,
                125000,131324,137795,144410,151165,158056,165079,172229,179503,186894,
                194400,202013,209728,217540,225443,233431,241496,249633,257834,267406,
                276458,286328,296358,305767,316074,326531,336255,346965,357812,367807,
                378880,390077,400293,411686,423190,433572,445239,457001,467489,479378,
                491346,501878,513934,526049,536557,548720,560922,571333,583539,591882,
                600000],
    "Fluctuating": [0,4,13,32,65,112,178,276,393,
                    540,745,967,1230,1591,1957,2457,3046,3732,4526,
                    5440,6482,7666,9003,10506,12187,14060,16140,18439,20974,
                    23760,26811,30146,33780,37731,42017,46656,50653,55969,60505,
                    66560,71677,78533,84277,91998,98415,107069,114205,123863,131766,
                    142500,151222,163105,172697,185807,196322,210739,222231,238036,250562,
                    267840,281456,300293,315059,335544,351520,373744,390991,415050,433631,
                    459620,479600,507617,529063,559209,582187,614566,639146,673863,700115,
                    737280,765275,804997,834809,877201,908905,954084,987754,1035837,1071552,
                    1122660,1160499,1214753,1254796,1312322,1354652,1415577,1460276,1524731,1571884,
                    1640000],
    "Fast":       [int(0.8 * i**3) for i in range(101)],
    "MediumFast": [i**3 for i in range(101)],
    "MediumSlow": [int(1.2 * i**3 - 15 * i**2 + 100 * i - 140) for i in range(101)],
    "Slow":       [int(1.25 * i**3) for i in range(101)],
}

species_to_pokedex = defaultdict(list)

def setup_maps():
    for pokedex_id, pokemon in speciesMap.items():
        species_to_pokedex[pokemon['Species']].append(pokedex_id)
    species_dict = dict(species_to_pokedex)
    return species_dict
