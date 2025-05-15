import React from "react";
import './ModifierSelector.css';

const ModifierSelector = ({ modifiers, setModifiers, pokemon1, pokemon2}) => {
    return (
    <div className='modifiersCard'>
        <h3>Battle Modifiers</h3>
        <label className="weather-stockpile-select">
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
        <label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isReflect}
            onChange={(e) => setModifiers(prev => ({ ...prev, isReflect: e.target.checked }))}
          />
          Reflect
        </label>
        <label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isLightScreen}
            onChange={(e) => setModifiers(prev => ({ ...prev, isLightScreen: e.target.checked }))}
          />
          Light Screen
        </label>
        <label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isSeeded}
            onChange={(e) => setModifiers(prev => ({ ...prev, isSeeded: e.target.checked }))}
          />
          Leech Seed
        </label>
        <label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isTrapped}
            onChange={(e) => setModifiers(prev => ({ ...prev, isTrapped: e.target.checked }))}
          />
          Trapped
        </label>
        
        <label className="weather-stockpile-select">
          Spikes
          <input type="number" min={0} max={3} value={modifiers.spikes}  onChange={(e) => setModifiers(prev => ({ ...prev, spikes: e.target.value }))}/>
        </label>
        {
          ([pokemon1.status, pokemon2.status].includes('Badly Poisoned')) && (
            <label className="weather-stockpile-select">
              Toxic Turns
              <input type="number" min={0} max={100} value={modifiers.toxicTurn}  onChange={(e) => setModifiers(prev => ({ ...prev, toxicTurn: e.target.value }))}/>
            </label>
          )
        }
        <label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isCritical}
            onChange={(e) => setModifiers(prev => ({ ...prev, isCritical: e.target.checked }))}
          />
          Critical Hit
        </label>          
        {([pokemon1.ability, pokemon2.ability].includes('Flash Fire')) &&
        (<label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isFlashFire}
            onChange={(e) => setModifiers(prev => ({ ...prev, isFlashFire: e.target.checked }))}
          />
          FlashFire
        </label>)}
        {(Object.values(pokemon1.moves).includes(268) || Object.values(pokemon2.moves).includes(268)) &&
        (<label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isCharge}
            onChange={(e) => setModifiers(prev => ({ ...prev, isCharge: e.target.checked }))}
          />
          Charge
        </label>)}
        <label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isForesight}
            onChange={(e) => setModifiers(prev => ({ ...prev, isForesight: e.target.checked }))}
          />
          Foresight/Odor Sleuth
        </label>
        {((Object.values(pokemon1.moves).includes(91)) || (Object.values(pokemon2.moves).includes(91))) && 
        (<label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.inGround}
            onChange={(e) => setModifiers(prev => ({ ...prev, inGround: e.target.checked }))}
          />
          Underground
        </label>)
        }
        {((Object.values(pokemon1.moves).includes(291)) || (Object.values(pokemon2.moves).includes(291))) && 
        (<label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.inWater}
            onChange={(e) => setModifiers(prev => ({ ...prev, inWater: e.target.checked }))}
          />
          Underwater
        </label>)
        }
        {((Object.values(pokemon1.moves).includes(19)) || (Object.values(pokemon2.moves).includes(19)) || (Object.values(pokemon1.moves).includes(340)) || (Object.values(pokemon2.moves).includes(340))) && 
        (<label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.inAir}
            onChange={(e) => setModifiers(prev => ({ ...prev, inAir: e.target.checked }))}
          />
          in Air
        </label>)
        }
        {((Object.values(pokemon1.moves).includes(205)) || (Object.values(pokemon2.moves).includes(205)) || (Object.values(pokemon1.moves).includes(301)) || (Object.values(pokemon2.moves).includes(301))) && ((Object.values(pokemon1.moves).includes(111)) || (Object.values(pokemon2.moves).includes(111))) && 
        (<label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isDefenceCurl}
            onChange={(e) => setModifiers(prev => ({ ...prev, isDefenceCurl: e.target.checked }))}
          />
          Defence Curl+Rollout/Ice Ball
        </label>)
        }
        
        {((Object.values(pokemon1.moves).includes(255)) || (Object.values(pokemon2.moves).includes(255))) &&
        (<label className="weather-stockpile-select">
          Stockpile
          <input type="number" min={0} max={3} value={modifiers.stockpile}  onChange={(e) => setModifiers(prev => ({ ...prev, stockpile: e.target.value }))}/>
        </label>)
        }
        {(Object.values(pokemon1.moves).includes(228) || Object.values(pokemon2.moves).includes(228)) &&
        (<label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isSwitching}
            onChange={(e) => setModifiers(prev => ({ ...prev, isSwitching: e.target.checked }))}
          />
          Switching
        </label>)
        }
        {(Object.values(pokemon1.moves).includes(107) || Object.values(pokemon2.moves).includes(107)) &&
        (<label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isMini}
            onChange={(e) => setModifiers(prev => ({ ...prev, isMini: e.target.checked }))}
          />
          Minimize
        </label>)
        }
        <label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isDoubleBattle}
            onChange={(e) => setModifiers(prev => ({ ...prev, isDoubleBattle: e.target.checked }))}
          />
          Double Battle
        </label>
        {modifiers.isDoubleBattle &&
          (
          <div>
            <label className="fieldCheck">
              <input
                type="checkbox"
                checked={modifiers.isHelpingHand}
                onChange={(e) => setModifiers(prev => ({ ...prev, isHelpingHand: e.target.checked }))}
              />
              Helping Hand
            </label>           
            {([pokemon1.ability, pokemon2.ability].includes('Plus') || ([pokemon1.ability, pokemon2.ability].includes('Minus'))) &&
            (<label className="fieldCheck">
              <input
                type="checkbox"
                checked={modifiers.isPlusMinus}
                onChange={(e) => setModifiers(prev => ({ ...prev, isPlusMinus: e.target.checked }))}
              />
              Plus/Minus
            </label>)
            }
          </div>
          )
        }
        {((Object.values(pokemon1.moves).includes(346)) || (Object.values(pokemon2.moves).includes(346)) || modifiers.isDoubleBattle) && 
        (<label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isMudSport}
            onChange={(e) => setModifiers(prev => ({ ...prev, isMudSport: e.target.checked }))}
          />
          Mud Sport
        </label>)
        }
        {((Object.values(pokemon1.moves).includes(346)) || (Object.values(pokemon2.moves).includes(346)) || modifiers.isDoubleBattle) && 
        (<label className="fieldCheck">
          <input
            type="checkbox"
            checked={modifiers.isWaterSport}
            onChange={(e) => setModifiers(prev => ({ ...prev, isWaterSport: e.target.checked }))}
          />
          Water Sport
        </label>)
        }
      </div>)
}

export default ModifierSelector;