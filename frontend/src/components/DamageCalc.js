import React, { useState } from 'react';
import PokemonPanel from './PokemonPanel.js';
import { calculateDamage } from './CalcDamage.js';
import { move_data } from './move_data.js';

const blankPokemon = {
  name: "Custom",
  nickname: "Custom",
  level: 50,
  nature: "Hardy",
  ability: "None",
  held_item: 0,
  stats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
  evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  moves: { 0: 0, 1: 0, 2: 0, 3: 0 },
  type1: "Normal",
  type2: null
};

const DamageCalc = ({ party, pc }) => {
  const [attacker, setAttacker] = useState(blankPokemon);
  const [defender, setDefender] = useState(blankPokemon);
  const [result, setResult] = useState(null);

  const handleCalc = (slot, source) => {
    const user = source === "attacker" ? attacker : defender;
    const target = source === "attacker" ? defender : attacker;
  
    const moveId = user.moves[slot];
    const move = move_data[moveId];
  
    if (!move || !move.power) {
      setResult({ message: "Invalid move or no power" });
      return;
    }
  
    const dmg = calculateDamage(user, target, move);
    setResult({
      move: move.name,
      min: dmg.min,
      max: dmg.max,
      effectiveness: dmg.effectiveness,
      stab: dmg.stab,
      userName: user.name,
      targetName: target.name
    });
  };
  

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '100px', marginTop: '20px'}}>
      <PokemonPanel
        pokemon={attacker}
        setPokemon={setAttacker}
        party={party}
        pcBoxes={pc}
        onCalc={(slot) => handleCalc(slot, "attacker")}
      />
      <PokemonPanel
        pokemon={defender}
        setPokemon={setDefender}
        party={party}
        pcBoxes={pc}
        onCalc={(slot) => handleCalc(slot, "defender")}
      />
      {result && (
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}>
          <h3>Result</h3>
          <p>{result.userName} used <b>{result.move}</b> on {result.targetName}!</p>
          <p>Damage: {result.min}–{result.max}</p>
          <p>STAB: ×{result.stab}, Effectiveness: ×{result.effectiveness}</p>
        </div>
      )}
    </div>
  );
};

export default DamageCalc;
