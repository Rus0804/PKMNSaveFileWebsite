# GBA Save File Website

This site is designed for Nuzlockers and enthusiasts who want an easy bridge between **Pokémon Showdown** and **PKHeX**, while offering extra Nuzlocke-focused features.

---

## ⭐️ Features

-  **Reads save files directly** — no hassle with extracting `.pkm` or Pokémon Showdown sets
- Displays key **trainer info** for that added spice
-  **Encounter table viewer** for the entire region
-  **Auto-tracks dupes clause** when checking encounters
-  Beautiful view of your Pokémon with **EVs, IVs, nature, moves**, and more
-  Assign **badges** to the team that beat a boss
-  **Tribute page** for fallen Nuzlocke Pokémon
-  Built-in **Gen 3 damage calculator**, with trainer data baked in
-  All data is stored securely when logged in — view it anytime without re-uploading
-  Supports **multiple save files** per user

---

## ✅ Completed Features

- Fully functional save file reader (except badge data)
- Complete login system with database support via Supabase
- Pages to view trainer and Pokémon data
- Encounter table with dupe differentiation
- In-progress **damage calculator**

---

## 🚧 Remaining Tasks

- [ ] Save file cap (max 5 per user)
- [ ] Tribute page
- [ ] Badge assignment support for trainers and Pokémon
- [ ] Encounter tracking & area ordering improvements
- [ ] Bot to keep backend alive (e.g. for free hosting platforms)
- [ ] Import remaining trainer data

---

## 🔗 Useful Links

- [Website Progress Progress](https://ethereal-galliform-902.notion.site/GBA-save-file-website-1f1a8e985f4380d8bce7c44c68154b12?pvs=4)

---

## 📚 Resources

- Encounter data: https://shinyfinder.github.io/encounter-slots/
- PokéAPI (via `pokebase`) for move/item/ability data: https://pokeapi.co/
- Pokémon stats/moves dataset: https://www.kaggle.com/datasets/thiagoamancio/full-pokemons-and-moves-datasets?select=metadata_pokemon_moves.csv
- Trainer data: https://www.speedrun.com/pkmnfrlg/resources
- **Bulbapedia** for various things including Save data structure and downgrading from the later gen updated datasets down to Gen III:
  - Abilities: https://bulbapedia.bulbagarden.net/wiki/Category:Abilities_introduced_in_Generation_III
  - Move updates: https://bulbapedia.bulbagarden.net/wiki/List_of_modified_moves
  - EXP formula: https://bulbapedia.bulbagarden.net/wiki/Experience#Gain_formula
  - Damage formula: https://bulbapedia.bulbagarden.net/wiki/Damage
  - Save structure: https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_III)

---

## 🧰 Tech Stack

- **Backend:** Python + FastAPI
- **Frontend:** React + Node.js
- **Database:** Supabase (PostgreSQL)

