import React from 'react';
import './MovePanel.css';
import { move_data } from '../../data/move_data.js';

const MovePanel = ({ side, attacker, defender, onUseMove, setHits, modifiers, setPower }) => {
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
                src={attacker.shiny? `/Sprites/Pokemon/BW/shiny/${attacker.pokedex_num}s.png`:(`/Sprites/Pokemon/BW/${attacker.pokedex_num?attacker.pokedex_num:0}.png`)}
                alt={attacker.name}
            />
      </div>
      <div className="moves">
        {[0, 1, 2, 3].map((slot) => {
          const moveId = attacker.moves[slot];
          const move = move_data[moveId];
          return (
            <div key = {`${side}-${attacker.pokedex_num}-${slot}`} className='move'>
              <button
                key={slot}
                className="moveButton"
                onClick={() => handleClick(slot)}
                disabled={!move || !move.name}
              >
                {move?.name || "—"}
              </button>
              {(move?.multiple) && (
                <>
                  <input className='multihit-select' type='number' value = {modifiers.numHits} min={move.minHits} max={move.maxHits} onChange={(e) => setHits(prev => ({ ...prev, numHits: e.target.value }))}></input>
                  Hits
                </> 
                )}
              {(move?.name === 'Magnitude') && (
                <>
                    <select
                      value={modifiers.movePower}
                      onChange={(e) => setPower(prev => ({ ...prev, movePower: e.target.value }))}
                    >
                      <option value={10}>{10}</option>
                      <option value={30}>{30}</option>
                      <option value={50}>{50}</option>
                      <option value={70}>{70}</option>
                      <option value={90}>{90}</option>
                      <option value={110}>{110}</option>
                      <option value={150}>{150}</option>
                    </select>
                    Power
                </> 
              )}
              {(move?.name === 'Present') && (
                <>
                    <select
                      value={modifiers.movePower}
                      onChange={(e) => setPower(prev => ({ ...prev, movePower: e.target.value }))}
                    >
                      <option value={40}>{40}</option>
                      <option value={80}>{80}</option>
                      <option value={120}>{120}</option>
                    </select>
                    Power
                </> 
              )}
              {(move?.name === 'Psywave') && (
                <>
                    <select
                      value={modifiers.movePower}
                      onChange={(e) => setPower(prev => ({ ...prev, movePower: e.target.value }))}
                    >
                      <option value={Math.floor(attacker.level * (10*0 + 50)/100)}>{Math.floor(attacker.level * (10*0 + 50)/100)}</option>
                      <option value={Math.floor(attacker.level * (10*1 + 50)/100)}>{Math.floor(attacker.level * (10*1 + 50)/100)}</option>
                      <option value={Math.floor(attacker.level * (10*2 + 50)/100)}>{Math.floor(attacker.level * (10*2 + 50)/100)}</option>
                      <option value={Math.floor(attacker.level * (10*3 + 50)/100)}>{Math.floor(attacker.level * (10*3 + 50)/100)}</option>
                      <option value={Math.floor(attacker.level * (10*4 + 50)/100)}>{Math.floor(attacker.level * (10*4 + 50)/100)}</option>
                      <option value={Math.floor(attacker.level * (10*5 + 50)/100)}>{Math.floor(attacker.level * (10*5 + 50)/100)}</option>
                      <option value={Math.floor(attacker.level * (10*6 + 50)/100)}>{Math.floor(attacker.level * (10*6 + 50)/100)}</option>
                      <option value={Math.floor(attacker.level * (10*7 + 50)/100)}>{Math.floor(attacker.level * (10*7 + 50)/100)}</option>
                      <option value={Math.floor(attacker.level * (10*8 + 50)/100)}>{Math.floor(attacker.level * (10*8 + 50)/100)}</option>
                      <option value={Math.floor(attacker.level * (10*9 + 50)/100)}>{Math.floor(attacker.level * (10*9 + 50)/100)}</option>
                      <option value={Math.floor(attacker.level * (10*10 + 50)/100)}>{Math.floor(attacker.level * (10*10 + 50)/100)}</option>
                    </select>
                    Power
                </> 
              )
              }
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MovePanel;
