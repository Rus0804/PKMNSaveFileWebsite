import React from 'react';
import { item_data } from '../../data/item_data';
import './PCBoxes.css';

function PCBoxes({ boxes, onCardClick}) {
  
  if (!boxes) {
    return <p>Loading PC Pokémon...</p>;
  }

  return (
    <section>
      <h2>PC Boxes</h2>

      {Object.entries(boxes).map(([boxNum, mons]) => {
        if(mons.length>0){
          return(
          <div key={boxNum} className="pc-box">
            <h3>Box {boxNum}</h3>
            <div className="pc-grid">
              {mons.map((mon, idx) => (
                <div
                  className="pc-card"
                  key={idx}
                  onClick={() => onCardClick(mon)} // Trigger side panel on click
                  style={{ cursor: mon ? 'pointer' : 'default' }}
                >
                  <img
                    src={mon.shiny?`/Sprites/Pokemon/BW/shiny/${mon.pokedex_num}s.png`:`/Sprites/Pokemon/BW/${mon.pokedex_num}.png`}
                    alt={mon.nickname || mon.name}
                    className="pc-sprite"
                  />
                  <h4>{mon.nickname || mon.species}</h4>
                  <p><strong>Lv:</strong> {mon.level}</p>
                  <p><strong>Nature:</strong> {mon.nature}</p>
                  <p><strong>Held Item:</strong> {mon.held_item === 0 ? 'None' : item_data.find(item => item.id === mon.held_item).name}</p>
                </div>
              ))}
            </div>
          </div>
          )
        }
        else{return null}       
      })}
    </section>
  );
}

export default PCBoxes;
