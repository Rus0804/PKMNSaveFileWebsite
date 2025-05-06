import React from 'react';
import './PartyList.css';
import { item_data } from './item_data.js';

function PartyList({ party, onCardClick }) {
  // Ensure exactly 6 slots in the party
  const filledParty = [...party];
  while (filledParty.length < 6) {
    filledParty.push(null);
  }

  return (
    <section>
      <h2>Party Pokémon</h2>
      <div className="party-grid">
        {filledParty.map((pokemon, index) => (
          <div
            className="pokemon-card"
            key={index}
            onClick={() => pokemon && onCardClick(pokemon)} 
            style={{ cursor: pokemon ? 'pointer' : 'default' }}
          >
            {pokemon ? (
              <>
                <img
                  src={`/Sprites/Pokemon/BW/${pokemon.pokedex_num}.png`}
                  alt={pokemon.nickname || pokemon.species}
                  className="party-sprite"
                  onError={(e) => {
                    e.target.src = '/sprites/gen5/0.png'; 
                  }}
                />
                <h3>{pokemon.nickname || pokemon.name}</h3>
                <p><strong>Level:</strong> {pokemon.level}</p>
                <p><strong>Nature:</strong> {pokemon.nature}</p>
                <p><strong>Ability:</strong> {pokemon.ability}</p>
                <p><strong>Held Item:</strong> {pokemon.held_item === 0 ? 'None' : item_data.find(item => item.id === pokemon.held_item).name}</p>
              </>
            ) : (
              <div className="empty-slot">Empty</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default PartyList;
