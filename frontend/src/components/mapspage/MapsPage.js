import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MapsPage.css';

const frlgMap = {
  id: 'viridian-forest',
  title: 'Viridian Forest',
  subtitle: 'FRLG trainer map',
  image: '\\mapData\\ViridianForest.jpg',
  hotspots: [
    { trainer: 'Bug Catcher Doug', top: '43.7%', left: '86.2%' },
    { trainer: 'Bug Catcher Rick', top: '66.7%', left: '86.2%' },
    { trainer: 'Bug Catcher Charlie', top: '8.8%', left: '29%' },
    { trainer: 'Bug Catcher Anthony', top: '10%', left: '78.7%' },
    { trainer: 'Bug Catcher Sammy', top: '33.3%', left: '12%' }
  ]
};

function MapsPage({ game, saveVersion, onTrainerSelect }) {
  const navigate = useNavigate();

  const handleTrainerClick = (trainerName) => {
    if (onTrainerSelect) {
      onTrainerSelect(trainerName);
    }
    navigate('/damage');
  };

 return (
    <section className="mapsCard">
      <h2>Maps</h2>
      <p>Click a trainer marker on the map image to set the right-side trainer in Damage Calc.</p>

      <div className="mapsMeta">
        <p>Current game profile: {game}</p>
        <p>Loaded save family: {saveVersion}</p>
      </div>

      {saveVersion === 'FRLG' ? (
        <article key={frlgMap.id} className="areaMapCard singleMapCard">
          <header>
            <h3>{frlgMap.title}</h3>
            <p>{frlgMap.subtitle}</p>
          </header>

          <div className="mapImageWrap" aria-label={`${frlgMap.title} trainer map`}>
            <img
              src={frlgMap.image}
              alt={`${frlgMap.title} map`}
              className="mapImage"
              onError={(e) => {
                e.currentTarget.src = '/logo192.png';
              }}
            />

            {frlgMap.hotspots.map((spot) => (
              <button
                key={spot.trainer}
                type="button"
                className="mapHotspot"
                style={{ top: spot.top, left: spot.left }}
                title={`Set ${spot.trainer} in damage calc`}
                onClick={() => handleTrainerClick(spot.trainer)}
              >
                <span className="hotspotDot" aria-hidden="true" />
                <span className="hotspotLabel">{spot.trainer}</span>
              </button>
            ))}
          </div>
        </article>
      ) : (
        <div className="mapsPlaceholder">Trainer image-map quick-select is currently available for FRLG saves.</div>
      )}
    </section>
  );
}

export default MapsPage;