import React from 'react';
import './Graveyard.css';

function Graveyard({ party = [], boxes = {}, onCardClick }) {
  const deadParty = party.filter((pokemon) => pokemon && pokemon.alive === false);
  const deadPC = Object.entries(boxes).flatMap(([boxNum, mons]) =>
    mons
      .filter((pokemon) => pokemon && pokemon.alive === false)
      .map((pokemon) => ({ ...pokemon, boxNum }))
  );

  const hasDeadPokemon = deadParty.length > 0 || deadPC.length > 0;

  return (
    <section className="graveyard-page">
      <h2>Pokémon Graveyard</h2>
      <p className="graveyard-subtitle">Remembering all Pokémon marked as dead.</p>

      {!hasDeadPokemon && (
        <div className="graveyard-empty">
          <p>No fallen Pokémon yet.</p>
        </div>
      )}

      {deadParty.length > 0 && (
        <div className="graveyard-section">
          <h3>Party</h3>
          <div className="graveyard-grid">
            {deadParty.map((pokemon) => (
              <article
                key={`party-${pokemon.personality}`}
                className="graveyard-card"
                onClick={() => onCardClick(pokemon)}
              >
                <img
                  src={pokemon.shiny
                    ? `/Sprites/Pokemon/BW/shiny/${pokemon.pokedex_num}s.png`
                    : `/Sprites/Pokemon/BW/${pokemon.pokedex_num}.png`}
                  alt={pokemon.nickname || pokemon.name}
                  className="graveyard-sprite"
                />
                <h4>{pokemon.nickname || pokemon.species}</h4>
                <p><strong>Level:</strong> {pokemon.level}</p>
                <p><strong>Last Seen:</strong> Party</p>
              </article>
            ))}
          </div>
        </div>
      )}

      {deadPC.length > 0 && (
        <div className="graveyard-section">
          <h3>PC Boxes</h3>
          <div className="graveyard-grid">
            {deadPC.map((pokemon) => (
              <article
                key={`pc-${pokemon.personality}`}
                className="graveyard-card"
                onClick={() => onCardClick(pokemon)}
              >
                <img
                  src={pokemon.shiny
                    ? `/Sprites/Pokemon/BW/shiny/${pokemon.pokedex_num}s.png`
                    : `/Sprites/Pokemon/BW/${pokemon.pokedex_num}.png`}
                  alt={pokemon.nickname || pokemon.name}
                  className="graveyard-sprite"
                />
                <h4>{pokemon.nickname || pokemon.species}</h4>
                <p><strong>Level:</strong> {pokemon.level}</p>
                <p><strong>Last Seen:</strong> Box {pokemon.boxNum}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Graveyard;
