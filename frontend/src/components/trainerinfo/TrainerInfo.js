import React, { useState } from 'react';
import './TrainerInfo.css';

function TrainerInfo({ trainer, money, version }) {
  const [earnedBadges, setEarnedBadges] = useState(Array(8).fill(false));

  const toggleBadge = (index) => {
    setEarnedBadges((prev) =>
      prev.map((earned, i) => (i === index ? !earned : earned))
    );
  };

  const spriteMap = {
    "FRLG": { Male: 'red.png', Female: 'leaf.png' },
    "RSE": { Male: 'Ebrendan.png', Female: 'Emay.png' },
  };
  const spriteFile = spriteMap[version]?.[trainer.gender] || 'default.png';
  const spriteSrc = `/Sprites/Trainers/gen3/${version}/${spriteFile}`;

  return (
    <div className="trainer-info">
      <h2>Trainer Info</h2>
      <div className="trainer-card">
        <img src={spriteSrc} alt="Trainer Sprite" className="trainer-sprite" />
        <div className="trainer-details">
          <p><strong>Name:</strong> {trainer.name}</p>
          <p><strong>Gender:</strong> {trainer.gender}</p>
          <p><strong>Trainer ID:</strong> {trainer.trainer_id}</p>
          <p><strong>Secret ID:</strong> {trainer.secret_id}</p>
          <p><strong>Money:</strong> ${money}</p>
        </div>
      </div>

      <h3>Badges</h3>
      <div className="badges-container">
        {earnedBadges.map((earned, index) => (
          <img
            key={index}
            src={`/Sprites/Badges/${version}-${index + 1}.png`}
            alt={`Badge ${index + 1}`}
            className={`badge-icon ${earned ? 'earned' : 'unearned'}`}
            onClick={() => toggleBadge(index)}
            title={`Click to ${earned ? 'remove' : 'earn'} badge`}
          />
        ))}
      </div>
    </div>
  );
}

export default TrainerInfo;
