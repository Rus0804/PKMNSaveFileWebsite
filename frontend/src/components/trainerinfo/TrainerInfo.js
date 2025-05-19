import React, { useState } from 'react';
import './TrainerInfo.css';

function TrainerInfo({ trainer, money, version, saveId, token, setData }) {
  const { name, gender, trainer_id, secret_id, badges: initialBadges } = trainer;
  const [earnedBadges, setEarnedBadges] = useState([...initialBadges]);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [status, setStatus] = useState(null);

  const updateTrainerInSave = (updatedTrainer) => {
    const stored = localStorage.getItem('selected_save');
    const saveData = stored ? JSON.parse(stored) : null;

    if (!saveData) return;
    
    const updatedSaveData = {
      ...saveData.save_data,
      trainer: updatedTrainer
    };

    const updatedSave = {
      ...saveData,
      save_data: updatedSaveData,
    };

    localStorage.setItem('selected_save', JSON.stringify(updatedSave));
    setData(updatedSaveData);
  };

  const toggleBadge = async (index) => {
    if (loadingIndex !== null) return; // Prevent multiple simultaneous requests

    const prevBadges = [...earnedBadges];
    const updatedBadges = earnedBadges.map((earned, i) =>
      i === index ? !earned : earned
    );

    setLoadingIndex(index)
    if(saveId && token){
        
      try {
        const response = await fetch(`${process.env.REACT_APP_PROD}/saves/${saveId}/badges`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ badges: updatedBadges }),
        });

        if (!response.ok) {
          throw new Error('Failed to update badges');
        }

        setStatus('Badges updated successfully');
      } catch (err) {
        setEarnedBadges(prevBadges); // Revert UI
        setStatus('Error saving badges');
      }
    }
    else{
      console.log(loadingIndex, index)
      setStatus('Badges updated successfully');
    }
    
    setEarnedBadges(updatedBadges);
    setLoadingIndex(null);
    setStatus(null);

    const updatedTrainer = { ...trainer, badges: updatedBadges };
    updateTrainerInSave(updatedTrainer);

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
            className={`badge-icon ${earned ? 'earned' : 'unearned'} ${loadingIndex === index ? 'disabled' : ''}`}
            onClick={() => toggleBadge(index)}
            title={loadingIndex === index ? 'Saving...' : `Click to ${earned ? 'remove' : 'earn'} badge`}
          />
        ))}
      </div>

      {status && <p className="badge-status">{status}</p>}
    </div>
  );
}

export default TrainerInfo;
