import React, { useState } from 'react';
import './Sidebar.css';
import { move_data } from '../../data/move_data.js';
import { item_data } from '../../data/item_data.js';

const Sidebar = ({ pokemon, closeSidebar, version, saveId, token, setData }) => {
  const [isAlive, setIsAlive] = useState(pokemon.alive);
  const [badges, setBadges] = useState(pokemon.badges || []);

  const updatePokemonInSave = (updatedPokemon) => {
    const stored = localStorage.getItem('selected_save');
    const saveData = stored ? JSON.parse(stored) : null;

    if (!saveData) return;

    const { party, pc } = saveData.save_data;

    const updatedParty = party.map(mon =>
      mon.personality === updatedPokemon.personality ? updatedPokemon : mon
    );

    const updatedPC = {};
    for (const [boxName, box] of Object.entries(pc)) {
      updatedPC[boxName] = box.map(mon =>
        mon.personality === updatedPokemon.personality ? updatedPokemon : mon
      );
    }

    const updatedSaveData = {
      ...saveData.save_data,
      party: updatedParty,
      pc: updatedPC,
    };

    const updatedSave = {
      ...saveData,
      save_data: updatedSaveData,
    };

    localStorage.setItem('selected_save', JSON.stringify(updatedSave));
    setData(updatedSaveData);
  };


  const handleClose = () => {
    closeSidebar();
  };

  const handleAliveToggle = async () => {
    if (!isAlive) return;

    const confirmChange = window.confirm(
      `Are you sure you want to mark this Pokémon as ${isAlive ? 'dead' : 'alive'}?\n\nThis change is permanent.`
    );
    if (!confirmChange) return;

    const updatedAlive = !isAlive;
    const updatedPokemon = { ...pokemon, alive: updatedAlive };
    setIsAlive(updatedAlive);
    updatePokemonInSave(updatedPokemon);

    if(saveId && token){
      try {
        const response = await fetch(`${process.env.REACT_APP_PROD}/saves/${saveId}/pokemon`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pokemon }),
        });

        if (!response.ok) {
          throw new Error('Failed to update alive status');
        }
      } catch (err) {
        console.error('Error updating alive status:', err);
        setIsAlive(!updatedAlive); // revert UI on error
      }
    }

    
  };

  const toggleBadge = async (badgeIndex) => {
    const updatedBadges = [...badges];
    updatedBadges[badgeIndex] = !updatedBadges[badgeIndex];

    // Optimistic UI update
    const updatedPokemon = { ...pokemon, badges: updatedBadges };
    setBadges(updatedBadges);
    updatePokemonInSave(updatedPokemon);
    
    if(saveId && token){
      try {
        const response = await fetch(`${process.env.REACT_APP_PROD}/saves/${saveId}/pokemon`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pokemon }),
        });

        if (!response.ok) {
          throw new Error('Failed to update badge status');
        }
      } catch (err) {
        console.error('Error updating badge status:', err);
        // Revert on error
        updatedBadges[badgeIndex] = !updatedBadges[badgeIndex];
        setBadges([...updatedBadges]);
        pokemon.badges = updatedBadges;
      }
    }
    
  };

  if (!pokemon) return null;

  const { stats, ivs, evs, moves } = pokemon;

  return (
    <div className="global-sidebar open">
      <button className="close-button" onClick={handleClose}>×</button>
      <br />
      <div className="sidebar-header">
        <div className='pokemon-name-status'>
          <h2>{pokemon.nickname || pokemon.name}</h2>
          <button
            className={`alive-toggle ${isAlive ? 'alive' : 'dead'}`}
            onClick={handleAliveToggle}
          >
            {isAlive ? '🟢 Alive' : '⚰️ Dead'}
          </button>
        </div>
        <img
          src={pokemon.shiny
            ? `/Sprites/Pokemon/BW/shiny/${pokemon.pokedex_num}s.png`
            : `/Sprites/Pokemon/BW/${pokemon.pokedex_num}.png`}
          alt={pokemon.nickname || pokemon.name}
          className="sidebar-sprite"
        />
      </div>

      <div className="scrollable-content">
        {badges.length > 0 && (
          <div className="badges-section">
            <p><strong>Badges Contributed To:</strong></p>
            <div className="badges-container">
              {badges.map((contributed, index) => (
                <img
                  key={index}
                  src={`/Sprites/Badges/${version}-${index + 1}.png`}
                  alt={`Badge ${index + 1}`}
                  className={`badge-icon ${contributed ? 'active' : 'inactive'}`}
                  onClick={() => toggleBadge(index)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="sidebar-info">
          <p><strong>Level:</strong> {pokemon.level}</p>
          <p><strong>Nature:</strong> {pokemon.nature}</p>
          <p><strong>Ability:</strong> {pokemon.ability}</p>
          <p><strong>Held Item:</strong> {pokemon.held_item === 0
            ? 'None'
            : item_data.find(item => item.id === pokemon.held_item)?.name || 'Unknown'}</p>
        </div>

        <table className="stat-table">
          <thead>
            <tr>
              <th> </th>
              <th>Stats</th>
              <th>IV</th>
              <th>EV</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(stats).map((stat, index) => (
              <tr key={index}>
                <td>{stat.charAt(0).toUpperCase() + stat.slice(1)}</td>
                <td>{stats[stat]}</td>
                <td>{ivs[stat]}</td>
                <td>{evs[stat]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='hidden-power-info'>
          <p><strong>Hidden Power</strong></p>
          <p><strong>Type:</strong> {pokemon.hidden_power[0]}</p>
          <p><strong>Power:</strong> {pokemon.hidden_power[1]}</p>
        </div>

        <p><strong>Moves</strong></p>
        <div className="moves-list">
          {Object.values(moves).map((move_id, i) => {
            const move_name = move_id !== 0 ? move_data[move_id]?.name : 'None';
            return (
              <span key={i} className="move-chip">{move_name}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
