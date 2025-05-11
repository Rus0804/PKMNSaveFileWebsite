import { type_chart } from '../../data/type_chart.js';

// moves are physical based on types in gen 3
const physicalTypes = ["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel"];

export function calculateDamage(attacker, defender, move, modifiers) {
  // Status moves shouldn't go further 
  if(move.category === 'Status'){
    return {
      min: 0,
      max: 0,
      effectiveness: 0,
      stab: 0,
      raw: 0
    };
  }

  const level = attacker.level;
  var power = move.power || 0;

  const isPhysical = physicalTypes.includes(move.type);

  // check which stats to use
  const atkStat = isPhysical ? 'atk' : 'spa';
  const defStat = isPhysical ? 'def' : 'spd';

  var attack = attacker.stats[atkStat];
  var defense = defender.stats[defStat];

  if(atkStat==='atk'){
    // guts boost check
    if(attacker.ability === 'Guts' && attacker.status !== 'None'){
      attack *= 1.5;
    }
    // if not guts, then burn effect
    else if (attacker.status==='Burned'){
      attack /= 2;
    }
    // attack boosts from the other abilities 
    if(['Huge Power', 'Pure Power'].includes(attacker.ability)){
      attack *= 2;
    }
    else if(attacker.ability === 'Hustle'){
      attack *= 1.5;
    }
    // marvel scale boost
    if(defender.ability === 'Marvel Scale' && defender.status !== 'None'){
      defense *= 1.5;
    }
  }

  // thick fat halves opp attack rather than half effectiveness
  if(defender.ability === 'Thick Fat' && ['fire', 'ice'].includes(move.type.toLowerCase())){
    attack *= 0.5;
  }

  const stab = (attacker.type1.toLowerCase() === move.type.toLowerCase() || attacker.type2.toLowerCase() === move.type.toLowerCase()) ? 1.5 : 1;

  const type1 = defender.type1.toLowerCase() || "normal";
  const type2 = defender.type2;

  var effectiveness = (type_chart[move.type.toLowerCase()][type1]) * (type2!=='none' ? (type_chart[move.type.toLowerCase()][type2]) : 1);

  // abilities that make type immunities
  const immunity_abilities = ['Flash Fire', 'Levitate', 'Volt Absorb', 'Water Absorb']

  if(immunity_abilities.includes(defender.ability)){

    const immunity_types = {
      'Flash Fire': 'fire', 'Levitate': 'ground', 
      'Volt Absorb': 'electric', 'Water Absorb': 'water'
    }
    if(move.type.toLowerCase() === immunity_types[defender.ability]){
      effectiveness = 0;
    }
  }

  // Hyper Voice, Uproar is the only sound based attacking move
  if(['Hyper Voice', 'Uproar'].includes(move.name) && defender.ability === 'Soundproof'){
    effectiveness = 0;
  }

  // Wonder guard ig
  if(defender.ability === 'Wonder Guard' && effectiveness < 2){
    effectiveness = 0;
  }

  // if this is 0, we don't need anything else
  if(effectiveness === 0){
    return {
      min: 0,
      max: 0,
      effectiveness: 0,
      stab: stab,
      raw: 0
    };
  }

  // these are the held items that affect stuff
  const held_items = [186, 188, 191, 192, 193, 199, 202, 217, 215, 209, 205, 208, 212, 207, 211, 203, 210, 214, 204, 213, 216, 206, 223, 224, 220];

  if(held_items.includes(attacker.held_item) || held_items.includes(defender.held_item)){
    const type_booster_items = { 
      "normal": 217, "fire": 215, "water": 209, "grass": 205, "electric": 208, "ice": 212, 
      "fighting": 207, "poison": 211, "ground": 203, "flying": 210, "psychic": 214, "bug": 188, 
      "rock": 204, "ghost": 213, "dragon": 216, "dark": 206, "steel": 199 
    }

    if (atkStat==='spa') {
      // soul dew for latios/latias
      if(attacker.pokedex_num === 381 || attacker.pokedex_num === 380){
        if(attacker.held_item===191){
          attack *= 1.5;
        }
      }
      // deep sea whatever for clamperl
      else if(attacker.pokedex_num === 366 || attacker.pokedex_num === 366){
        if(attacker.held_item===192){
          attack *= 1.5;
        }
      }
      // soul dew for latios/latias
      if(defender.pokedex_num === 381 || defender.pokedex_num === 380){
        if(defender.held_item===191){
          defense *= 1.5;
        }
      }
      // deep sea whatever for clamperl
      else if(defender.pokedex_num === 366 || defender.pokedex_num === 366){
        if(defender.held_item===193){
          defense *= 1.5;
        }
      }
    }
    // cubone marowak thick club
    else if(attacker.pokedex_num === 104 && attacker.pokedex_num === 105){
      if(attacker.held_item === 224){
        attack *= 2;
      }
    }
    // lightball for pikachu
    if (attacker.pokedex_num===25 && attacker.held_item === 202){
      attack *= 1.5;
    }
    // metal powder for ditto
    if(defender.pokedex_num===120 && defender.held_item === 223){
      defense *= 1.5
    }

    if(attacker.held_item === type_booster_items[move.type.toLowerCase()]){
      power *= 1.1;
    }

    // choice band is 186
    if(attacker.held_item === 186){
      attack *= 3/2;
    }

    // sea incense for some reason
    if(attacker.held_item === 220 && move.type.toLowerCase() === 'water'){
      power *= 1.05;
    }
  }

  if(attacker.currentHP <= attacker.stats.hp/3){
    const type_boost_abilities = ['Blaze', 'Overgrow', 'Torrent', 'Swarm'];
    if(type_boost_abilities.includes(attacker.ability)){
      const types_affected = {'Blaze': 'fire', 'Overgrow': 'grass', 'Torrent': 'water', 'Swarm': 'bug'}
      if(move.type.toLowerCase() === types_affected[attacker.ability]){
        power *= 1.5;
      }
    }
  }

  var flashfire = 1;
  if(modifiers.isFlashFire && move.type.toLowerCase()==='fire'){
    flashfire = 1.5;
  }

  var charge = 1;
  if(modifiers.isCharge && move.type.toLowerCase()==='electric'){
    charge = 1.5;
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

  // not implemented yet
  var stockpile = 1;
  var doubledmg = 1;

  var targets = 1;
  if(modifiers.isDoubleBattle){
    if (move.target==='multiple'){
      targets = 0.5;
    }
  }

  var screen = 1
  if(atkStat==='atk' && modifiers.isReflect){
    if(modifiers.isDoubleBattle){
      screen = 2/3;
    }
    else{
      screen = 0.5;
    }   
  }
  else if(atkStat==='spa' && modifiers.isLightScreen){
    if(modifiers.isDoubleBattle){
      screen = 2/3;
    }
    else{
      screen = 0.5;
    }
  }

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
