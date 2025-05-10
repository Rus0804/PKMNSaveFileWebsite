import React from 'react';
import './MovePanel.css';
import { move_data } from '../../data/move_data.js';

const MovePanel = ({ attacker, defender, onUseMove }) => {
  const handleClick = (slot) => {
    const moveId = attacker.moves[slot];
    const move = move_data[moveId];
    if (move && move.power) {
      onUseMove(slot, attacker, defender, move);
    }
  };

  return (
    <div className="panel">
      <div className="sprite-container">
            <img
                src={`/Sprites/Pokemon/BW/${attacker.pokedex_num?attacker.pokedex_num:0}.png`}
                alt={attacker.name}
            />
      </div>
      <div className="moves">
        {[0, 1, 2, 3].map((slot) => {
          const moveId = attacker.moves[slot];
          const move = move_data[moveId];
          return (
            <button
              key={slot}
              className="moveButton"
              onClick={() => handleClick(slot)}
              disabled={!move || !move.name}
            >
              {move?.name || "—"}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MovePanel;
