import React, { useEffect, useState } from "react";
import axios from "axios";
import { speciesMap } from "./species_map.js"; // Import speciesMap
import "./Encounters.css";

const EncounterViewer = ({ game, party, pc }) => {
  const [encounters, setEncounters] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState("area"); // "pokemon" or "area"
  const [selectedMethod, setSelectedMethod] = useState("All");

  // Function to get species ID from Pokémon name
  const getSpeciesIdFromName = (name) => {
    for (let pokedexNum in speciesMap) {
      if (speciesMap[pokedexNum].Name.toLowerCase() === name.toLowerCase()) {
        return speciesMap[pokedexNum].Species;
      }
    }
    return null; // Return null if not found
  };

  useEffect(() => {
    const fetchEncounters = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_PROD}/encounters`);
        setEncounters(response.data);
      } catch (error) {
        console.error("Failed to fetch encounters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEncounters();
  }, []);

  // Get species IDs for Pokémon in party and PC
  const allSpeciesIdsInParty = party.map(p => p.species_id);  // species_id for each Pokémon
  const allSpeciesIdsInPC = Object.values(pc).flatMap(box => box.map(p => p.species_id));
  const allSpeciesIdsInPartyAndPC = [...allSpeciesIdsInParty, ...allSpeciesIdsInPC];

  if (loading) return <div className="loading">Loading...</div>;

  const gameData = encounters[game];
  if (!gameData) return <div className="error">No data found for {game}</div>;

  const methodOptions = ["All", ...Object.keys(gameData)];
  const filteredMethods =
    selectedMethod === "All"
      ? Object.entries(gameData)
      : Object.entries(gameData).filter(([method]) => method === selectedMethod);

  return (
    <div className="encounter-container">
      <h2 className="game-title">Encounters for {game.toUpperCase()}</h2>

      <div className="encounter-filters">
        <label>
          <select
            value={searchMode}
            onChange={(e) => setSearchMode(e.target.value)}
          >
            <option value="pokemon">Search Pokémon</option>
            <option value="area">Search Area</option>
          </select>
        </label>

        <input
          type="text"
          placeholder={`Search ${searchMode}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />

        <label>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
          >
            {methodOptions.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </label>
      </div>

      {filteredMethods.map(([method, areas]) => (
        <div key={method} className="method-card">
          <h3 className="method-title">{method}</h3>

          {Object.entries(areas).map(([area, pokemonMap]) => {
            const areaMatch = area.toLowerCase().includes(searchTerm);
            const pokemonMatch = Object.keys(pokemonMap).some(pokemon =>
              pokemon.toLowerCase().includes(searchTerm)
            );

            if (searchTerm && ((searchMode === "area" && !areaMatch) || (searchMode === "pokemon" && !pokemonMatch))) {
              return null;
            }

            return (
              <div key={area} className="area-block">
                <h4 className="area-title">{area}</h4>
                <table className="encounter-table">
                  <thead>
                    <tr>
                      <th>Pokémon</th>
                      <th>Level Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(pokemonMap).map(([pokemonName, levels], idx) => {
                      if (
                        searchTerm &&
                        searchMode === "pokemon" &&
                        !pokemonName.toLowerCase().includes(searchTerm)
                      ) return null;

                      // Convert Pokémon name to species ID
                      const speciesId = getSpeciesIdFromName(pokemonName); // species_id
                      // Check if this species is in the party or PC
                      const isInPartyOrPC = allSpeciesIdsInPartyAndPC.includes(speciesId);

                      return (
                        <tr
                          key={pokemonName}
                          className={idx % 2 === 0 ? "even-row" : "odd-row"}
                          style={{
                            backgroundColor: isInPartyOrPC ? "lightcoral" : "lightgreen",
                          }}
                        >
                          <td>{pokemonName}</td>
                          <td>
                            {Array.isArray(levels)
                              ? levels.join(", ")
                              : typeof levels === "object" && levels !== null
                                ? Object.values(levels).join(" - ")
                                : String(levels)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default EncounterViewer;
