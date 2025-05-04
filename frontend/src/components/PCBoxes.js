import React from 'react';
import './PCBoxes.css';

function PCBoxes({ boxes, onCardClick}) {
  
  if (!boxes) {
    return <p>Loading PC Pokémon...</p>;
  }

  return (
    <section>
      <h2>PC Boxes</h2>
      {Object.entries(boxes).map(([boxNum, mons]) => (
        <div key={boxNum} className="pc-box">
          <h3>Box {boxNum}</h3>
          <div className="pc-grid">
            {mons.map((mon, idx) => (
              <div
                className="pc-card"
                key={idx}
                onClick={() => onCardClick(mon)} // Trigger side panel on click
                style={{ cursor: mon ? 'pointer' : 'default' }}
              >
                <img
                  src={`/Sprites/Pokemon/BW/${mon.pokedex_num}.png`}
                  alt={mon.nickname || mon.name}
                  className="pc-sprite"
                />
                <h4>{mon.nickname || mon.species}</h4>
                <p><strong>Lv:</strong> {mon.level}</p>
                <p><strong>Nature:</strong> {mon.nature}</p>
                <p><strong>Held Item:</strong> {mon.held_item === 0 ? 'None' : mon.held_item}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default PCBoxes;
