import { type_chart } from '../../data/type_chart.js';

// moves are physical based on types in gen 3
const physicalTypes = ["normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel"];

export function calculateDamage(attacker, defender, move, modifiers) {
  // Status moves shouldn't go further 
  if(move.category === 'Status'){
    return {
      effectiveness: 0,
      stab: 0,
      range: [0],
      recoil: [],
      heal: []
    };
  }

  const level = attacker.level;
  var power = move.power || 0;
  const move_type = move.name === 'Hidden Power'?attacker.hidden_power[0].toLowerCase() : move.type.toLowerCase()

  // Moves based on Hp
  if(['Eruption', 'Water Spout'].includes(move.name)){
    power = Math.floor((150 * attacker.currentHP)/attacker.stats.hp) || 1;
  }
  else if(['Reversal', 'Flail'].includes(move.name)){
    var check = attacker.currentHP/attacker.stats.hp
    if(check>=0.688){
      power = 20;
    }
    else if(check>=0.354){
      power = 40;
    }
    else if(check>=0.208){
      power = 80;
    }
    else if(check>=0.104){
      power = 100;
    }
    else if(check>=0.042){
      power = 150;
    }
    else{
      power = 250;
    }
  }
  else if(['Earthquake', 'Magnitude'].includes(move.name) && modifiers.inGround){
    power *= 2;
  }
  else if(['Surf', 'Whirlpool'].includes(move.name) && modifiers.inWater){
    power *= 2;
  }
  else if(['Gust', 'Twister'].includes(move.name) && modifiers.inAir){
    power *= 2;
  }
  else if(move.name === 'Facade' && attacker.status !== 'None'){
    power *= 2
  }
  else if (['Fury Cutter', 'Rollout', 'Ice Ball'].includes(move.name)){
    if(modifiers.isDefenceCurl){
      power *= 2
    }
    power *= 2**modifiers.numHits
  }
  else if(move.multiple){
    power *= modifiers.numHits
  }
  else if(move.name === 'Hidden Power'){
    power = attacker.hidden_power[1]
  }
  else if(['Psywave', 'Magnitude', 'Present'].includes(move.name)){
    power = modifiers.movePower
  }
  else if(move.name === 'Low Kick'){
    if(defender.weight <= 99){
      power = 20
    }
    else if(defender.weight <= 249){
      power = 40
    }
    else if(defender.weight <= 499){
      power = 60
    }
    else if(defender.weight <= 999){
      power = 80
    }
    else if(defender.weight <= 1999){
      power = 100
    }
    else{
      power = 120
    }
  }
  else if(['Return', 'Frustration'].includes(move.name)){
    if(move.name === 'Return'){
      power = Math.lower(attacker.friendship/2.5)
    }
    else{
      power = Math.lower((255 - attacker.friendship)/2.5)
    } 
  }

  if(modifiers.isMudSport && move_type ==='Electric'){
    power /= 2
  }
  else if(modifiers.isWaterSport && move_type ==='Fire'){
    power /= 2
  }

  const isPhysical = physicalTypes.includes(move_type);

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
  else{
    // Plus Minus spA boost
    if(modifiers.isPlusMinus){
      attack *= 1.5;
    }
  }

  // thick fat halves opp attack rather than half effectiveness
  if(defender.ability === 'Thick Fat' && ['fire', 'ice'].includes(move_type)){
    attack *= 0.5;
  }

  const stab = (attacker.type1.toLowerCase() === move_type || attacker.type2.toLowerCase() === move_type) ? 1.5 : 1;

  const type1 = defender.type1.toLowerCase() || "normal";
  const type2 = defender.type2;

  var effectiveness = (type_chart[move_type][type1]) * (type2!=='none' ? (type_chart[move_type][type2]) : 1);

  // abilities that make type immunities
  const immunity_abilities = ['Flash Fire', 'Levitate', 'Volt Absorb', 'Water Absorb']

  if(immunity_abilities.includes(defender.ability)){

    const immunity_types = {
      'Flash Fire': 'fire', 'Levitate': 'ground', 
      'Volt Absorb': 'electric', 'Water Absorb': 'water'
    }
    if(move_type === immunity_types[defender.ability]){
      effectiveness = 0;
    }
  }

  // Hyper Voice, Uproar is the only sound based attacking move
  if(['Hyper Voice', 'Uproar'].includes(move.name) && defender.ability === 'Soundproof'){
    effectiveness = 0;
  }

  // Foresight and OdorSleuth remove immunity for ghost
  if([type1.toLowerCase(), type2.toLowerCase()].includes('ghost') && modifiers.isForesight){
    if(['normal', 'fighting'].includes(move_type)){
      const new_type_chart = {
        normal:    { normal: 1, fire: 1, water: 1, grass: 1, electric: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 1, dragon: 1, dark: 1, steel: 0.5 },
        fighting:  { normal: 2, fire: 1, water: 1, grass: 1, electric: 1, ice: 2, fighting: 1, poison: 0.5, ground: 1, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 1, dragon: 1, dark: 2, steel: 2 },
      }
      effectiveness = (new_type_chart[move_type][type1]) * (type2!=='none' ? (new_type_chart[move_type][type2]) : 1);
    }
  }

  // Wonder guard ig
  if(defender.ability === 'Wonder Guard' && effectiveness < 2){
    effectiveness = 0;
  }

  // Damp stops boom
  if(['Explosion', 'Self Destruct'].includes(move.name) && defender.ability === 'Damp'){
    effectiveness = 0;
  }
  // OHKO moves fully done 
  else if(['Guillotine', 'Fissure', 'Sheer Cold', 'Horn Drill'].includes(move.name) && effectiveness > 0){
    if(defender.ability === 'Sturdy' || defender.level >= attacker.level){
      effectiveness = 0;
    }
    else{
      return {
        effectiveness: effectiveness,
        stab: stab,
        range: [defender.stats.hp],
        recoil: [],
        heal: []
      };
    }
  }

  // if this is 0, we don't need anything else
  if(effectiveness === 0){
    return {
      effectiveness: 0,
      stab: stab,
      range: [0],
      recoil: [],
      heal: []
    };
  }

  if(move.name === 'Dream Eater' && defender.status !== 'Sleeping'){
    return {
      effectiveness,
      stab: stab,
      range: [0],
      recoil: [],
      heal: []
    };
  }
  else if(move.name === 'Snore' && attacker.status !== 'Sleeping'){
    return {
      effectiveness,
      stab,
      range: [0],
      recoil: [],
      heal: []
    };
  }
  // Moves that do set damage
  else if(['Sonic Boom', 'Dragon Rage'].includes(move.name)){
    return {
      effectiveness,
      stab,
      range: move.name === 'Sonic Boom'? [20]: [40],
      recoil: [],
      heal: []
    };
  }
  else if(['Seismic Toss', 'Night Shade'].includes(move.name)){
    return {
      effectiveness,
      stab,
      range: [attacker.level],
      recoil: [],
      heal: []
    };
  }
  // Super fang
  else if(move.name === 'Super Fang'){
    return {
      effectiveness,
      stab,
      range: [parseInt(defender.currentHP/2)],
      recoil: [],
      heal: []
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

    if(attacker.held_item === type_booster_items[move_type]){
      power *= 1.1;
    }

    // choice band is 186
    if(attacker.held_item === 186){
      attack *= 3/2;
    }

    // sea incense for some reason
    if(attacker.held_item === 220 && move_type === 'water'){
      power *= 1.05;
    }
  }

  if(attacker.currentHP <= attacker.stats.hp/3){
    const type_boost_abilities = ['Blaze', 'Overgrow', 'Torrent', 'Swarm'];
    if(type_boost_abilities.includes(attacker.ability)){
      const types_affected = {'Blaze': 'fire', 'Overgrow': 'grass', 'Torrent': 'water', 'Swarm': 'bug'}
      if(move_type === types_affected[attacker.ability]){
        power *= 1.5;
      }
    }
  }

  var flashfire = 1;
  if(modifiers.isFlashFire && move_type ==='fire'){
    flashfire = 1.5;
  }

  var charge = 1;
  if(modifiers.isCharge && move_type ==='electric'){
    charge = 1.5;
  }

  var weather = 1;
  // Abilities that negate weather conditions
  if (!(['Air Lock', 'Cloud Nine'].includes(attacker.ability) || ['Air Lock', 'Cloud Nine'].includes(defender.ability))) {
    if(modifiers.weather === 'Rain'){
      if(move_type ==='water'){
        weather = 1.5;
      }
      else if(move_type ==='fire'){
        weather = 0.5;
      }
      else if(move.name === 'Weather Ball'){
        weather = 1.5;
      }
    }
    else if(modifiers.weather === 'Sun'){
      if(move_type==='fire'){
        weather = 1.5;
      }
      else if(move_type==='water'){
        weather = 0.5;
      }
      else if(move.name === 'Weather Ball'){
        weather = 1.5;
      }
    }

  }

  var hh = 1;
  if(modifiers.isHelpingHand){
    hh = 1.5;
  }

  var crit = 1;
  // these abilities stop crits
  if(modifiers.isCritical && !['Battle Armor', 'Shell Armor'].includes(defender.ability)){
    crit = 2;
  }

  var doubledmg = 1;

  // Weather ball
  if(move.name === 'Weather Ball' && weather !== 1){
    var temp_type = modifiers.weather === 'Rain'? 'water':'fire';
    effectiveness = (type_chart[temp_type][type1]) * (type2!=='none' ? (type_chart[temp_type][type2]) : 1);
    doubledmg = 2;
  }
  // Smelling Salts
  else if(move.name === 'Smelling Salts' && defender.status === 'Paralyzed'){
    doubledmg = 2;
  }

  // Pursuit
  else if(move.name === 'Pursuit' && modifiers.isSwitching){
    doubledmg = 2;
  }
  // minimize
  else if(modifiers.isMini && ['Stomp', 'Extrasensory', 'Astonish', 'Needle Arm'].includes(move.name)){
    doubledmg = 2
  }

  // more abilities : [Rough Skin]
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

  var stockpile = 1;
  if(move.name === 'Spit Up' && modifiers.stockpile){
    stockpile = modifiers.stockpile
    power = 100
    crit = 1
  }

  const baseDamage = Math.floor(Math.floor(Math.floor((2 * level / 5 + 2) * power * attack / defense) / 50) * flashfire * screen * targets + 2);

  const finalDamage = baseDamage * stab * effectiveness * weather * hh * charge * doubledmg * stockpile * crit;

  if(move.name === 'Spit Up' && modifiers.stockpile){
    return {
      effectiveness,
      stab,
      range: [finalDamage],
      recoil: [],
      heal: []
    };
  }


  var damageRange = []
  for(var i = 0.85; i <= 1; i+=0.01){
    damageRange.push(Math.floor(finalDamage*i))
  }

  var recoil = []
  var heal = []
  if(['Submission', 'Take Down', 'Struggle', 'Volt Tackle', 'Double Edge'].includes(move.name) && attacker.ability!=='Rock Head'){
    const recoilFactor = ['Volt Tackle', 'Double Edge'].includes(move.name)? 1/3 : 1/4
    for(i = 0.85; i <= 1; i+=0.01){
      recoil.push(Math.floor(finalDamage*i*recoilFactor))
    }
  }  
  else if(['Absorb', 'Mega Drain', 'Giga Drain', 'Leech Life', 'Dream Eater'].includes(move.name)){
    const healFactor = 1/2  
    if(defender.ability==='Liquid Ooze'){
      for(i = 0.85; i <= 1; i+=0.01){
        recoil.push(Math.floor(finalDamage*i*healFactor))
      }
    }
    else{
      for(i = 0.85; i <= 1; i+=0.01){
        heal.push(Math.floor(finalDamage*i*healFactor))
      }
    } 
  }
  else if(['Jump Kick', 'High Jump Kick'].includes(move.name)){
    const recoilFactor = 1/2
    for(i = 0.85; i <= 1; i+=0.01){
      recoil.push(Math.floor(finalDamage*i*recoilFactor))
    }
  }

  if((defender.ability === 'Rough Skin') && (move.contact)){
    if(recoil.length > 0){
      for(i = 0; i < recoil.length; i++){
        recoil[i] += Math.floor(attacker.currentHP/16)
      }
    }
    else{
      recoil = [Math.floor(attacker.currentHP/16)]
    }
  }

  return {
    effectiveness,
    stab,
    range: damageRange,
    recoil: recoil,
    heal: heal
  };
}
