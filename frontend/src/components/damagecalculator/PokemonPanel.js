import React, { useEffect, useState, useMemo } from 'react';
import { pokemon_data } from '../../data/pokemon_data.js';
import { move_data } from '../../data/move_data.js';
import { item_data } from '../../data/item_data.js';
import { ability_data } from '../../data/ability_data.js';
import { frlg_trainer_data } from '../../data/frlg_trainer_teams.js';
import { frlg_trainer_mons } from '../../data/frlg_trainer_pokemon.js';
import './PokemonPanel.css';

const statNames = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
const types = [
  'None',
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 
  'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 
  'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 
  'Steel'
]
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

const getHiddenPower = (ivs) => {
  const stats = ['hp', 'atk', 'def', 'spe', 'spa', 'spd']
  let check = 0;

  for (let i = 0; i < stats.length; i++) {
    check += (ivs[stats[i]] % 2) * (2 ** i);
  }

  const typeCheck = Math.floor((check * 15) / 63);
  const hiddenPowerTypes = [
    'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug',
    'Ghost', 'Steel', 'Fire', 'Water', 'Grass', 'Electric',
    'Psychic', 'Ice', 'Dragon', 'Dark'
  ];

  const hiddenPowerType = hiddenPowerTypes[typeCheck];
  const hiddenPowerPower = Math.floor((check * 40) / 63 + 30);
  return [hiddenPowerType, hiddenPowerPower]
}

const calculateStats = (stat, base, iv, ev, level, natureMod = 1, boostStage = 0) => {
  if (base === undefined) return 0;
  if (stat === 'hp') {
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }
  const unboosted = Math.floor(((((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * natureMod);
  return Math.floor(unboosted * getBoostMultiplier(boostStage));
};

// Gen III stat boost multipliers
const getBoostMultiplier = (stage) => {
  if (stage === 0) return 1.0;
  if (stage > 0) return (2 + stage) / 2;
  return 2 / (2 - stage);
};

const PokemonPanel = ({ pokemon, setPokemon, party, pcBoxes, version }) => {
  const [source, setSource] = useState('Any');
  const [pokeList, setPokeList] = useState([]);
  const [selectedTrainer, setTrainer] = useState('None');
  const [selectedPokeId, setSelectedPokeId] = useState(null);
  const [boosts, setBoosts] = useState(Object.fromEntries(statNames.map(stat => [stat, 0])));
  const [specialCondition, setSpecialCondition] = useState('None');

  const itemOptions = useMemo(() => {
    return Object.entries(item_data).map(([id, item]) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ));
    },[]);

  const moveOptions = useMemo(() => { 
    return Object.entries(move_data).map(([id, move]) => (
        <option key={id} value={id}>
          {move.name}
        </option>
      ));
    },[]);

    const abilityOptions = useMemo(() => { 
    return Object.entries(ability_data).map(([id, ability]) => (
        <option key={id} value={ability.name}>
          {ability.name}
        </option>
      ));
    },[]);

    const natureOptions = useMemo(() => { 
    return Object.entries(natures).map(([i, nature]) => (
        <option key={i} value={nature}>
          {nature}
        </option>
      ));
    },[]);

    const typeOptions = useMemo(() => { 
    return Object.entries(types).map(([i, type]) => (
        <option key={i} value={type.toLowerCase()}>
          {type}
        </option>
      ));
    },[]);

    const trainerOptions = useMemo(() => { 
    return Object.entries(frlg_trainer_data).map(([trainer, monList]) => (
        <option key={trainer} value={trainer}>
          {trainer}
        </option>
      ));
    },[]);

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
      const flatBox = Object.values(pcBoxes).reduce((acc, box) => acc.concat(Object.values(box)), []);
      setPokeList(flatBox.map(p => ({ ...p, source: 'Box' })));
    } else if (source === 'Trainers') {
      const trainerMonsList = Object.entries(frlg_trainer_mons).map(([name, data]) => ({
        name: name,
        data: data,
        source: 'TrainerMons'
      }));
      setPokeList(trainerMonsList);
    }
  }, [source, party, pcBoxes]);

  const updateStats = (updated, boosts={'hp':0,'atk':0,'def':0,'spa':0,'spd':0,'spe':0}) => {
    const baseStats = pokemon_data[updated.pokedex_num];
    const newStats = {};
    statNames.forEach(stat => {
      const modifier = getNatureModifier(updated.nature, stat);
      const boostStage = boosts[stat] || 0;
      newStats[stat] = calculateStats(stat, baseStats[stat], updated.ivs[stat], updated.evs[stat], updated.level, modifier, boostStage);
    });
    updated.stats = newStats;
    updated.currentHP = newStats.hp;
    setPokemon(updated);
  };

  const handleSelection = (e) => {
    const index = e.target.value;
    const selected = pokeList[index];
    setSelectedPokeId(index);
    if (source === 'Any') {
      const blankIVs = Object.fromEntries(statNames.map(stat => [stat, 31]));
      const blankEVs = Object.fromEntries(statNames.map(stat => [stat, 0]));
      const level = 50;
      const nature = 'Hardy';
      const baseStats = selected.base_stats;
      const newStats = {};

      statNames.forEach(stat => {
        newStats[stat] = calculateStats(stat, baseStats[stat], blankIVs[stat], blankEVs[stat], level);
      });

      const hidden_power = getHiddenPower(blankIVs)
      setBoosts(Object.fromEntries(statNames.map(stat => [stat, 0])));
      setPokemon({
        name: selected.name,
        nickname: 'Custom',
        pokedex_num: selected.pokedex_num,
        currentHP: newStats.hp,
        stats: newStats,
        ivs: blankIVs,
        evs: blankEVs,
        type1: selected.base_stats.type[0],
        type2: selected.base_stats.type[1],
        level,
        nature,
        ability: 'None',
        held_item: 0,
        moves: { 0: 0, 1: 0, 2: 0, 3: 0 },
        status: 'None',
        hidden_power: hidden_power,
        friendship: 0,
        shiny: false
      });
    } 
    else if (source === 'Trainers'){
      var pokedex_num = 0
      var base_stats = {}
      const monName = selected.source === 'TrainerMons'? selected.data.name : selected.name;
      for (const id in pokemon_data) {
        if(monName === pokemon_data[id].name){
            pokedex_num = parseInt(id);
            base_stats = pokemon_data[id];
            break;
        }
      }

      const baseStats = base_stats;
      setBoosts(Object.fromEntries(statNames.map(stat => [stat, 0])));

      const newStats = {};

      if(selected.source === 'Trainers'){
        statNames.forEach(stat => {
          newStats[stat] = calculateStats(stat, baseStats[stat], selected.IVS[stat], selected.EVS[stat], selected.Level);
        });

        const hidden_power = getHiddenPower(selected.IVS)
        setPokemon({
          name: selected.name,
          pokedex_num: pokedex_num,
          currentHP: newStats.hp,
          stats: newStats,
          ivs: selected.IVS,
          evs: selected.EVS,
          type1: base_stats.type[0],
          type2: base_stats.type[1],
          level: selected.Level,
          nature: selected.Nature,
          ability: selected.Ability,
          held_item: 0,
          moves: { 0: parseInt(selected.Attack_1) || 0, 1: parseInt(selected.Attack_2) || 0, 2: parseInt(selected.Attack_3) || 0, 3: parseInt(selected.Attack_4) || 0},
          status: 'None',
          hidden_power: hidden_power,
          friendship: 0,
          shiny: false
        });
      }
      else{
        statNames.forEach(stat => {
          newStats[stat] = calculateStats(stat, baseStats[stat], selected.data.IVS[stat], selected.data.EVS[stat], selected.data.Level);
        });
        const hidden_power = getHiddenPower(selected.data.IVS)
        
        setPokemon({
          name: selected.name,
          pokedex_num: pokedex_num,
          currentHP: newStats.hp,
          stats: newStats,
          ivs: selected.data.IVS,
          evs: selected.data.EVS,
          type1: base_stats.type[0],
          type2: base_stats.type[1],
          level: selected.data.Level,
          nature: selected.data.Nature,
          ability: selected.data.Ability,
          held_item: 0,
          moves: { 0: parseInt(selected.data.Attack_1) || 0, 1: parseInt(selected.data.Attack_2) || 0, 2: parseInt(selected.data.Attack_3) || 0, 3: parseInt(selected.data.Attack_4) || 0},
          status: 'None',
          hidden_power: hidden_power,
          friendship: 0,
          shiny: false
        });
      }
      
    }
    else {
      setBoosts(Object.fromEntries(statNames.map(stat => [stat, 0])));
      updateStats(selected);
      selected.currentHP = selected.stats.hp;
      setPokemon(selected);
    }
  };

  const handleIVEVChange = (type, stat, value) => {
    const updated = { ...pokemon };
    updated[type][stat] = parseInt(value) || 0;
    if(type==='ivs'){
      updated.hidden_power = getHiddenPower(updated[type])
    }
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

  const handleBoostChange = (stat, stage) => {
    const newBoosts = { ...boosts, [stat]: parseInt(stage) };
    setBoosts(newBoosts);
    updateStats({ ...pokemon }, newBoosts);
  };

  const handleMoveChange = (slot, moveId) => {
    const updated = { ...pokemon };
    updated.moves[slot] = parseInt(moveId);
    setPokemon(updated);
  };

  const handleConditionChange = (e) => {
    setSpecialCondition(e.target.value);
    const updated = { ...pokemon };
    updated.status = e.target.value;
    setPokemon(updated);
  };

  const handleItemChange = (e) => {
    const updated = { ...pokemon };
    updated.held_item = parseInt(e.target.value);
    setPokemon(updated);
  };

  const handleAbilityChange = (e) => {
    const updated = { ...pokemon };
    updated.ability = e.target.value;
    setPokemon(updated);
  };

  const handleFriendshipChange = (e) => {
    const updated = { ...pokemon };
    updated.friendship = e.target.value;
    setPokemon(updated);
  };

  const handleHPChange = (e) => {
    const updated = {...pokemon};
    updated.currentHP = parseInt(e.target.value)>updated.stats.hp?updated.stats.hp:parseInt(e.target.value);
    setPokemon(updated);
  }

  const handleTypeChange = (slot, e) => {
    const updated = {...pokemon};
    if(slot === 1){
      updated.type1 = e.target.value.toLowerCase();
    }
    else{
      updated.type2 = e.target.value.toLowerCase();
    }
    setPokemon(updated);
  }

  const handleTrainerChange = (e) => {
    setTrainer(e.target.value);
    setPokeList(frlg_trainer_data[e.target.value].map(p => ({ ...p, source: 'Trainers' })))
  }

  return (
    <div className="pokemon-panel">
      <label>
        Source:
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="Any">Any</option>
          <option value="Party">Party</option>
          <option value="Box">Box</option>
          {(version === 'FRLG') && (<option value="Trainers">Trainers</option>)}
        </select>
      </label>

      {(source === 'Trainers') &&
      (<label>
        Select Trainer:
        <select onChange={handleTrainerChange} value={selectedTrainer}>
          <option value="">--Select--</option>
          {trainerOptions}
        </select>
      </label>)}

      <label>
        Select Pokémon:
        <select onChange={handleSelection} value={selectedPokeId || ''}>
          <option value="">--Select--</option>
          {pokeList.map((p, i) => (
            <option key={i} value={i}>
              {p.nickname || p.name}
            </option>
          ))}
        </select>
      </label>

      {pokemon.name && (
        <>
          <div className="level-nature-hp">
            <label>
              Level:
              <input type="number" min="1" max="100" value={pokemon.level} onChange={handleLevelChange} disabled={!selectedPokeId} />
            </label>
            <label>
              Friendship:
                <input type="number" min="0" max={255} value={pokemon.friendship} onChange={handleFriendshipChange} disabled={!selectedPokeId} />
            </label>
            <label>
              HP:
                <input type="number" min="0" max="{pokemon.stats.hp}" value={pokemon.currentHP} onChange={handleHPChange} disabled={!selectedPokeId} />
            </label>
            <label>
              Nature:
              <select value={pokemon.nature} onChange={handleNatureChange} disabled={!selectedPokeId}>
                {natureOptions}
              </select>
            </label>
          </div>
          <div className='types'>
            <h4>Types:</h4>
            <label>
              <select value={pokemon.type1} onChange={(e) => handleTypeChange(1, e)} disabled={!selectedPokeId}>
                {typeOptions}
              </select>
            </label>
            <label>
              <select value={pokemon.type2} onChange={(e) => handleTypeChange(2, e)} disabled={!selectedPokeId}>
                {typeOptions}
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
                  <th>Boost</th>
                  <th>Final</th>
                </tr>
              </thead>
              <tbody>
                {statNames.map(stat => (
                  <tr key={stat}>
                    <td>{stat.toUpperCase()}</td>
                    <td>
                      <input type="number" min="0" max="31" value={pokemon.ivs[stat]} onChange={(e) => handleIVEVChange('ivs', stat, e.target.value)} disabled={!selectedPokeId}/>
                    </td>
                    <td>
                      <input type="number" min="0" max="252" value={pokemon.evs[stat]} onChange={(e) => handleIVEVChange('evs', stat, e.target.value)} disabled={!selectedPokeId}/>
                    </td>
                    <td>
                      { (stat!=='hp') &&
                      (<select value={boosts[stat]} onChange={(e) => handleBoostChange(stat, e.target.value)} disabled={!selectedPokeId}>
                        {Array.from({ length: 13 }, (_, i) => i - 6).map(stage => (
                          <option key={stage} value={stage}>
                            {stage >= 0 ? `+${stage}` : `${stage}`}
                          </option>
                        ))}
                      </select>)}
                    </td>
                    <td>{pokemon.stats[stat]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="special-condition">
            <label>
              Special Condition:
              <select value={specialCondition} onChange={handleConditionChange} disabled={!selectedPokeId}>
                <option value="None">None</option>
                <option value="Poisoned">Poisoned</option>
                <option value="Burned">Burned</option>
                <option value="Paralyzed">Paralyzed</option>
                <option value="Sleeping">Sleeping</option>
                <option value="Badly Poisoned">Toxic</option>
              </select>
            </label>
          </div>

          <div className="held-item">
            <label>
              Held Item
              <select value={pokemon.held_item} onChange={handleItemChange} disabled={!selectedPokeId}>
                <option value="0">None</option>
                {itemOptions}
              </select>
            </label>
          </div>
          <div className="abilities">
            <label>
              Ability
              <select value={pokemon.ability} onChange={handleAbilityChange} disabled={!selectedPokeId}>
                <option value="0">None</option>
                {abilityOptions}
              </select>
            </label>
          </div>

          <div className="move-selectors">
            <h4>Moves</h4>
            {[0, 1, 2, 3].map(slot => {
              const moveId = pokemon.moves[slot];
              const move = move_data[moveId];
              return (
                <div key={slot} className="move-slot">
                  <select value={moveId} onChange={(e) => handleMoveChange(slot, e.target.value)} disabled={!selectedPokeId}>
                    <option value="0">None</option>
                    {moveOptions}
                  </select>
                  {move && (
                    <div className="move-info">
                      <strong>{move.name}</strong> — {move.name==='Hidden Power'?pokemon.hidden_power[0]: move.type} | {move.category} | {(move.name === 'Hidden Power'? pokemon.hidden_power[1]:move.power) ?? '—'} Power
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
