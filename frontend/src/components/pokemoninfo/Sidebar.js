import React from 'react';
import './Sidebar.css';
import { move_data } from '../../data/move_data.js';
import { item_data } from '../../data/item_data.js';

const Sidebar = ({ pokemon, closeSidebar }) => {
  
  const handleClose = () => {
    closeSidebar();
  };

  if (!pokemon) return null;

  const { stats, ivs, evs, moves } = pokemon;

  return (
    <div className="global-sidebar open">
      <button className="close-button" onClick={handleClose}>×</button>

      <div className="sidebar-header">
        <h2>{pokemon.nickname || pokemon.name}</h2>
        <img
          src={pokemon.shiny?`/Sprites/Pokemon/BW/shiny/${pokemon.pokedex_num}s.png`:`/Sprites/Pokemon/BW/${pokemon.pokedex_num}.png`}
          alt={pokemon.nickname || pokemon.name}
          className="sidebar-sprite"
        />
      </div>

      <div className="scrollable-content">
        <div className="sidebar-info">
          <p><strong>Level:</strong> {pokemon.level}</p>
          <p><strong>Nature:</strong> {pokemon.nature}</p>
          <p><strong>Ability:</strong> {pokemon.ability}</p>
          <p><strong>Held Item:</strong> {pokemon.held_item === 0 ? 'None' : item_data.find(item => item.id === pokemon.held_item).name}</p>
        </div>

        {/* Stats Table */}
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
        
        <div>
            <p><strong>Hidden Power</strong></p>
            <p><strong>Type:</strong> {pokemon.hidden_power[0]}</p>
            <p><strong>Power:</strong> {pokemon.hidden_power[1]}</p>
        </div>
        

        {/* Moves List */}
        <p><strong>Moves</strong></p>
        <div className="moves-list">
          
          {Object.values(moves).map((move_id, i) => {
            var move_name;
            if (move_id!==0){
              move_name = move_data[move_id]["name"]
            }
            else{
              move_name = 'None'
            }
            return (
              <span key={i} className="move-chip">{move_name}</span>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
