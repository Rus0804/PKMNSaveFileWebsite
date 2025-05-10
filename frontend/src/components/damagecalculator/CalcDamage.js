import { type_chart } from '../../data/type_chart.js';

const physicalTypes = ["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel"];

export function calculateDamage(attacker, defender, move, modifiers) {
  const level = attacker.level;
  const power = move.power || 0;

  const isPhysical = physicalTypes.includes(move.type);
  const atkStat = isPhysical ? 'atk' : 'spa';
  const defStat = isPhysical ? 'def' : 'spd';

  const attack = (atkStat==='atk' && attacker.status==='Burned')?attacker.stats[atkStat]/2:attacker.stats[atkStat];
  const defense = defender.stats[defStat];

  const stab = (attacker.type1.toLowerCase() === move.type.toLowerCase() || attacker.type2.toLowerCase() === move.type.toLowerCase()) ? 1.5 : 1;

  const type1 = defender.type1 || "normal";
  const type2 = defender.type2 || null;

  const effectiveness = (type_chart[move.type.toLowerCase()][type1] || 1) * (type2 ? (type_chart[move.type.toLowerCase()][type2] || 1) : 1);

  var flashfire = 1;
  if(modifiers.isFlashFire && move.type.toLowerCase()==='fire'){
    flashfire = 1.5;
  }

  var charge = 1;
  if(modifiers.isCharge && move.type.toLowerCase()==='electric'){
    charge = 1.5;
  }

  var screen = 1
  if(atkStat==='atk' && modifiers.isReflect){
    screen = 0.5;
  }
  else if(atkStat==='spa' && modifiers.isLightScreen){
    screen = 0.5;
  }

  var weather = 1;
  if(modifiers.weather === 'Rain'){
    if(move.type.toLowerCase()==='water'){
      weather = 1.5;
    }
    else if(move.type.toLowerCase()==='fire'){
      weather = 0.5;
    }
  }
  else if(modifiers.weather === 'Sun'){
    if(move.type.toLowerCase()==='fire'){
      weather = 1.5;
    }
    else if(move.type.toLowerCase()==='water'){
      weather = 0.5;
    }
  }

  var hh = 1;
  if(modifiers.isHelpingHand){
    hh = 1.5;
  }

  var crit = 1;
  if(modifiers.isCritical){
    crit = 2;
  }

  var stockpile = 1;
  var targets = 1;
  var doubledmg = 1;

  const baseDamage = Math.floor(Math.floor(Math.floor((2 * level / 5 + 2) * power * attack / defense) / 50) * flashfire * screen * targets + 2);

  const finalDamage = baseDamage * stab * effectiveness * weather * hh * charge * doubledmg * stockpile * crit;

  return {
    min: Math.floor(finalDamage * 0.85),
    max: Math.floor(finalDamage),
    effectiveness,
    stab,
    raw: finalDamage
  };
}
