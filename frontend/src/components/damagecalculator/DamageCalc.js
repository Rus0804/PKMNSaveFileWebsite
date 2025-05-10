import React, { useState } from 'react';
import PokemonPanel from './PokemonPanel.js';
import { calculateDamage } from './CalcDamage.js';
import MovePanel from './MovePanel.js';
import './DamageCalc.css';

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
  const [modifiers, setModifiers] = useState({
    weather: 'None',
    isReflect: false,
    isLightScreen: false,
    isCritical: false,
    isHelpingHand: false,
    isFlashFire: false,
    isCharge: false
  });

  const handleMoveUse = (slot, attacker, defender, move) => {
    const dmg = calculateDamage(attacker, defender, move, modifiers);
    setResult({
      slot,
      move: move.name,
      min: dmg.min,
      max: dmg.max,
      effectiveness: dmg.effectiveness,
      stab: dmg.stab,
      userName: attacker.name,
      targetName: defender.name
    });
  };

  return (
    <div className="container">
      <div className='panels'>
        <MovePanel attacker={attacker} defender={defender} onUseMove={handleMoveUse} />
        <MovePanel attacker={defender} defender={attacker} onUseMove={handleMoveUse} />
      </div>

      <div className="modifiers">
        <h3>Battle Modifiers</h3>
        <label>
          Weather:
          <select
            value={modifiers.weather}
            onChange={(e) => setModifiers(prev => ({ ...prev, weather: e.target.value }))}
          >
            <option value="None">None</option>
            <option value="Rain">Rain</option>
            <option value="Sun">Sun</option>
            <option value="Sandstorm">Sandstorm</option>
            <option value="Hail">Hail</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={modifiers.isReflect}
            onChange={(e) => setModifiers(prev => ({ ...prev, isReflect: e.target.checked }))}
          />
          Reflect
        </label>
        <label>
          <input
            type="checkbox"
            checked={modifiers.isLightScreen}
            onChange={(e) => setModifiers(prev => ({ ...prev, isLightScreen: e.target.checked }))}
          />
          Light Screen
        </label>
        <label>
          <input
            type="checkbox"
            checked={modifiers.isCritical}
            onChange={(e) => setModifiers(prev => ({ ...prev, isCritical: e.target.checked }))}
          />
          Critical Hit
        </label>
        <label>
          <input
            type="checkbox"
            checked={modifiers.isHelpingHand}
            onChange={(e) => setModifiers(prev => ({ ...prev, isHelpingHand: e.target.checked }))}
          />
          Helping Hand
        </label>
        <label>
          <input
            type="checkbox"
            checked={modifiers.isFlashFire}
            onChange={(e) => setModifiers(prev => ({ ...prev, isFlashFire: e.target.checked }))}
          />
          FlashFire
        </label>
        <label>
          <input
            type="checkbox"
            checked={modifiers.isCharge}
            onChange={(e) => setModifiers(prev => ({ ...prev, isCharge: e.target.checked }))}
          />
          Charge
        </label>
        <label>
          <input
            type="checkbox"
            checked={modifiers.isDoubleBattle}
            onChange={(e) => setModifiers(prev => ({ ...prev, isDoubleBattle: e.target.checked }))}
          />
          Double Battle
        </label>
      </div>

      {result && (
        <div className="resultLine">
          <p>
            <strong>{result.userName}</strong> used <strong>{result.move}</strong> on <strong>{result.targetName}</strong>!
            <br />
            Damage: {result.min}–{result.max} <br />
            STAB: ×{result.stab}, Effectiveness: ×{result.effectiveness}
          </p>
        </div>
      )}

      <div className="panels">
        <PokemonPanel
          pokemon={attacker}
          setPokemon={setAttacker}
          party={party}
          pcBoxes={pc}
        />
        <PokemonPanel
          pokemon={defender}
          setPokemon={setDefender}
          party={party}
          pcBoxes={pc}
        />
      </div>
    </div>
  );
};

export default DamageCalc;
