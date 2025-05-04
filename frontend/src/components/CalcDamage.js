import { type_chart } from './type_chart.js'; // assumes a { [attackingType]: { [defendingType]: multiplier } } object

// Physical types in Gen III
const physicalTypes = ["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel"];

export function calculateDamage(attacker, defender, move) {
  const level = attacker.level;
  const power = move.power || 0;

  const isPhysical = physicalTypes.includes(move.type);
  const atkStat = isPhysical ? 'atk' : 'spa';
  const defStat = isPhysical ? 'def' : 'spd';

  const attack = attacker.stats[atkStat];
  const defense = defender.stats[defStat];

  const baseDamage = Math.floor(Math.floor(Math.floor((2 * level / 5 + 2) * power * attack / defense) / 50) + 2);
  console.log(attacker)
  const stab = (attacker.type1.toLowerCase() === move.type.toLowerCase() || attacker.type2.toLowerCase() === move.type.toLowerCase()) ? 1.5 : 1;

  const type1 = defender.type1 || "normal";
  const type2 = defender.type2 || null;
  console.log(type1, type2)
  console.log(type_chart[move.type.toLowerCase()])
  const effectiveness = (type_chart[move.type.toLowerCase()][type1] || 1) * (type2 ? (type_chart[move.type.toLowerCase()][type2] || 1) : 1);

  const finalDamage = baseDamage * stab * effectiveness;

  return {
    min: Math.floor(finalDamage * 0.85),
    max: Math.floor(finalDamage),
    effectiveness,
    stab,
    raw: finalDamage
  };
}
