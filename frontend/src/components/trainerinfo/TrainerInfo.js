import React, { useState } from 'react';
import './TrainerInfo.css';

function TrainerInfo({ trainer, money, version, saveId, token }) {
  const { name, gender, trainer_id, secret_id, badges: initialBadges } = trainer;
  const [earnedBadges, setEarnedBadges] = useState([...initialBadges]);
  const [loading, setLoading] = useState(false);

  const toggleBadge = async (index) => {
    const updatedBadges = earnedBadges.map((earned, i) =>
      i === index ? !earned : earned
    );
    
    setEarnedBadges(updatedBadges);
    setLoading(true);

    if(saveId && token){
      try {
        const response = await fetch(`${process.env.REACT_APP_PROD}/saves/${saveId}/badges`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ badges: updatedBadges }),
        });

        if (!response.ok) {
          console.error('Failed to save badges');
          // Optionally revert UI if it failed
          setEarnedBadges(earnedBadges);
        }
        else{
          console.log(response)
        }
      } catch (err) {
        console.error('Error updating badges:', err);
        setEarnedBadges(earnedBadges);
      }
    }    
    setLoading(false);
  };

  const spriteMap = {
    FRLG: { Male: 'red.png', Female: 'leaf.png' },
    RSE: { Male: 'Ebrendan.png', Female: 'Emay.png' },
  };
  const spriteFile = spriteMap[version]?.[gender] || 'default.png';
  const spriteSrc = `/Sprites/Trainers/gen3/${version}/${spriteFile}`;

  return (
    <div className="trainer-info">
      <h2>Trainer Info</h2>
      <div className="trainer-card">
        <img src={spriteSrc} alt="Trainer Sprite" className="trainer-sprite" />
        <div className="trainer-details">
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Gender:</strong> {gender}</p>
          <p><strong>Trainer ID:</strong> {trainer_id}</p>
          <p><strong>Secret ID:</strong> {secret_id}</p>
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
            className={`badge-icon ${earned ? 'earned' : 'unearned'} ${loading ? 'disabled' : ''}`}
            onClick={() => !loading && toggleBadge(index)}
            title={loading ? 'Saving...' : `Click to ${earned ? 'remove' : 'earn'} badge`}
          />
        ))}
      </div>
    </div>
  );
}

export default TrainerInfo;
