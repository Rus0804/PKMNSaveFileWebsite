import React, { useEffect, useState } from 'react';
import { pokemon_data } from './pokemon_data.js';
import { move_data } from './move_data.js';
import './PokemonPanel.css';

const statNames = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
const natures = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
  'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
  'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
  'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'
];

const natureModifiers = {
  Hardy: [null, null], Lonely: ['atk', 'def'], Brave: ['atk', 'spe'], Adamant: ['atk', 'spa'], Naughty: ['atk', 'spd'],
  Bold: ['def', 'atk'], Docile: [null, null], Relaxed: ['def', 'spe'], Impish: ['def', 'spa'], Lax: ['def', 'spd'],
  Timid: ['spe', 'atk'], Hasty: ['spe', 'def'], Serious: [null, null], Jolly: ['spe', 'spa'], Naive: ['spe', 'spd'],
  Modest: ['spa', 'atk'], Mild: ['spa', 'def'], Quiet: ['spa', 'spe'], Bashful: [null, null], Rash: ['spa', 'spd'],
  Calm: ['spd', 'atk'], Gentle: ['spd', 'def'], Sassy: ['spd', 'spe'], Careful: ['spd', 'spa'], Quirky: [null, null]
};

const getNatureModifier = (nature, stat) => {
  const [increase, decrease] = natureModifiers[nature] || [null, null];
  if (stat === increase) return 1.1;
  if (stat === decrease) return 0.9;
  return 1.0;
};

const calculateStats = (stat, base, iv, ev, level, modifier = 1) => {
  if (base === undefined) return 0;
  if (stat === 'hp') {
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10
  }
  return Math.floor(((((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * modifier);
};

const PokemonPanel = ({ pokemon, setPokemon, party, pcBoxes}) => {
  const [source, setSource] = useState('Any');
  const [pokeList, setPokeList] = useState([]);
  const [selectedPokeId, setSelectedPokeId] = useState(null);

  useEffect(() => {
    if (source === 'Any') {
      const anyList = Object.entries(pokemon_data).map(([id, data]) => ({
        name: data.name,
        pokedex_num: parseInt(id),
        source: 'Any',
        base_stats: data
      }));
      setPokeList(anyList);
    } else if (source === 'Party') {
      setPokeList(party.map(p => ({ ...p, source: 'Party' })));
    } else if (source === 'Box') {
      // Flatten the PC boxes to get all Pokémon in one list
      const flatBox = Object.values(pcBoxes).reduce((acc, box) => {
        return acc.concat(Object.values(box)); // Flatten each box and merge them
      }, []);
      setPokeList(flatBox.map(p => ({ ...p, source: 'Box' })));
    }
  }, [source, party, pcBoxes]);

  const updateStats = (updated) => {
    const baseStats = pokemon_data[updated.pokedex_num];
    const newStats = {};

    statNames.forEach(stat => {
      const modifier = getNatureModifier(updated.nature, stat);
      newStats[stat] = calculateStats(stat, baseStats[stat], updated.ivs[stat], updated.evs[stat], updated.level, modifier);
    });

    updated.stats = newStats;
    setPokemon(updated);
  };

  const handleSelection = (e) => {
    const index = e.target.value;
    const selected = pokeList[index];
    setSelectedPokeId(index);

    if (source === 'Any') {
      const blankIVs = Object.fromEntries(statNames.map(stat => [stat, 31]));
      const blankEVs = Object.fromEntries(statNames.map(stat => [stat, 0])) ;

      const level = 50;
      const nature = 'Hardy';
      const baseStats = selected.base_stats;
      const newStats = {};

      statNames.forEach(stat => {
        newStats[stat] = calculateStats(stat, baseStats[stat], blankIVs[stat], blankEVs[stat], level);
      });
      setPokemon({
        name: selected.name,
        nickname: 'Custom',
        pokedex_num: selected.pokedex_num,
        stats: newStats,
        ivs: blankIVs,
        evs: blankEVs,
        type1: selected.base_stats.type[0],
        type2: selected.base_stats.type[1],
        level,
        nature,
        ability: 'None',
        held_item: 0,
        moves: { 0: 0, 1: 0, 2: 0, 3: 0 }
      });
    } else {
        updateStats(selected);
        setPokemon(selected);
    }
  };

  const handleIVEVChange = (type, stat, value) => {
    const updated = { ...pokemon };
    updated[type][stat] = parseInt(value) || 0;
    updateStats(updated);
  };

  const handleLevelChange = (e) => {
    const updated = { ...pokemon, level: parseInt(e.target.value) || 1 };
    updateStats(updated);
  };

  const handleNatureChange = (e) => {
    const updated = { ...pokemon, nature: e.target.value };
    updateStats(updated);
  };

  const handleMoveChange = (slot, moveId) => {
    const updated = { ...pokemon };
    updated.moves[slot] = parseInt(moveId);
    setPokemon(updated);
  };

  return (
    <div className="pokemon-panel">
      <h2>Pokemon</h2>

      <label>
        Source:
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="Any">Any</option>
          <option value="Party">Party</option>
          <option value="Box">Box</option>
        </select>
      </label>

      <label>
        Select Pokémon:
        <select onChange={handleSelection} value={selectedPokeId || ''}>
          <option value="">--Select--</option>
          {pokeList.map((p, i) => {
            return(
            <option key={i} value={i}>
              {p.nickname || p.name}
            </option>
          )})}
        </select>
      </label>

      {pokemon.name && (
        <>
          <div className="sprite-container">
            <img
                src={`/Sprites/Pokemon/BW/${pokemon.pokedex_num?pokemon.pokedex_num:0}.png`}
                alt={pokemon.name}
            />
          </div>    
          <div className="level-nature">
            <label>
              Level:
              <input
                type="number"
                min="1"
                max="100"
                value={pokemon.level}
                onChange={handleLevelChange}
              />
            </label>

            <label>
              Nature:
              <select value={pokemon.nature} onChange={handleNatureChange}>
                {natures.map((nature, i) => (
                  <option key={i} value={nature}>{nature}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="stats-table">
            <table>
              <thead>
                <tr>
                  <th>Stat</th>
                  <th>IV</th>
                  <th>EV</th>
                  <th>Final</th>
                </tr>
              </thead>
              <tbody>
                {statNames.map(stat => (
                  <tr key={stat}>
                    <td>{stat.toUpperCase()}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="31"
                        value={pokemon.ivs[stat]}
                        onChange={(e) => handleIVEVChange('ivs', stat, e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="252"
                        value={pokemon.evs[stat]}
                        onChange={(e) => handleIVEVChange('evs', stat, e.target.value)}
                      />
                    </td>
                    <td>{pokemon.stats[stat]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="move-selectors">
          <h4>Moves</h4>
      {[0, 1, 2, 3].map(slot => {
        const moveId = pokemon.moves[slot];
        const move = move_data[moveId];

        return (
          <div key={slot} className="move-slot">
            <select value={moveId} onChange={(e) => handleMoveChange(slot, e.target.value)}>
              <option value="0">None</option>
              {Object.entries(move_data).map(([id, move]) => (
                <option key={id} value={id}>{move.name}</option>
              ))}
            </select>

            {move && (
              <div className="move-info">
                <strong>{move.name}</strong> — {move.type} | {move.category} | {move.power ?? '—'} Power
              </div>
            )}
            </div>
              );
            })}
          </div>

        </>
      )}
    </div>
  );
};

export default PokemonPanel;
