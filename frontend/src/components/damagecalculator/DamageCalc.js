import React, { useState } from 'react';
import PokemonPanel from './PokemonPanel.js';
import { calculateDamage } from './CalcDamage.js';
import ModifierSelector from './ModifierSelector.js';
import MovePanel from './MovePanel.js';
import './DamageCalc.css';

const blankPokemon = {
  name: "Custom",
  nickname: "Custom",
  level: 50,
  nature: "Hardy",
  ability: "None",
  held_item: 0,
  currentHP: 100,
  stats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
  evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  moves: { 0: 0, 1: 0, 2: 0, 3: 0 },
  type1: "normal",
  type2: "none"
};

const DamageCalc = ({ party, pc }) => {
  const [attacker, setAttacker] = useState(blankPokemon);
  const [defender, setDefender] = useState(blankPokemon);
  const [result, setResult] = useState(null);
  const [modifiers, setModifiers] = useState({
    weather: 'None',
    stockpile: 0,
    isReflect: false,
    isLightScreen: false,
    isCritical: false,
    isHelpingHand: false,
    isFlashFire: false,
    isCharge: false,
    isForesight: false,
    isPlusMinus: false,
    isSwitching: false,
    isDoubleBattle: false,
    isMudSport: false,
    isWaterSport: false,
    inAir: false,
    inGround: false,
    inWater: false,
  });

  const handleMoveUse = (slot, attacker, defender, move) => {
    const dmg = calculateDamage(attacker, defender, move, modifiers);
    setResult({
      slot,
      move: move.name,
      effectiveness: dmg.effectiveness,
      stab: dmg.stab,
      range: dmg.range,
      recoil: dmg.recoil,
      heal: dmg.heal,
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

      {result && (
        <div className="resultLine">
          <p>
            <strong>{result.userName}</strong> used <strong>{result.move}</strong> on <strong>{result.targetName}</strong>!
            <br />
            STAB: ×{result.stab}, Effectiveness: ×{result.effectiveness} <br />
            Range: {result.range?.map((dmg, i) => 
                  (<span key={i}>{dmg}{i < result.range.length - 1 ? ', ' : ''}</span>)
                )}
            {(result.recoil.length > 0) && (
            <>
            <br></br>
            {(['High Jump Kick', 'Jump Kick'].includes(result.move)) && (<>Potential Crash </>)}Recoil: {result.recoil?.map((dmg, i) => 
                  (<span key={i}>{dmg}{i < result.recoil.length - 1 ? ', ' : ''}</span>)
                )}
            </>
            )
            }
            {(result.heal.length > 0) && (
            <>
            <br></br>
            Heal: {result.heal?.map((dmg, i) => 
                  (<span key={i}>{dmg}{i < result.heal.length - 1 ? ', ' : ''}</span>)
                )}
            </>
            )
            }
            
          </p>
        </div>
      )}

      <div className='modifiers'>
        <ModifierSelector modifiers={modifiers} setModifiers={setModifiers} pokemon1={attacker} pokemon2={defender}></ModifierSelector>
      </div>

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
