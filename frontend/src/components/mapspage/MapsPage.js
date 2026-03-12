import { useNavigate } from 'react-router-dom';
import React, { useMemo, useState } from 'react';
import { frlgMaps } from '../../data/map_hotspots';
import './MapsPage.css';

function MapsPage({ game, saveVersion, onTrainerSelect }) {
  const navigate = useNavigate();
  const [activeMapId, setActiveMapId] = useState('pallet-town');
  const [mapMessage, setMapMessage] = useState('Use hotspots to navigate connected areas or pick up visible items.');

  const activeMap = useMemo(
    () => frlgMaps.find((mapEntry) => mapEntry.id === activeMapId) || frlgMaps[0],
    [activeMapId]
  );

  const handleHotspotClick = (spot) => {
    if (spot.type === 'trainer') {
      if (onTrainerSelect) {
        if(spot.label==='22 Rival'){
          onTrainerSelect('22 Rival 2(Bulbasaur)');
        }
        else{
          onTrainerSelect(spot.label);
        }
        
      }
      navigate('/damage');
      return;
    }

    if (spot.type === 'navigation' && spot.targetMapId) {
      setActiveMapId(spot.targetMapId);
      setMapMessage(`Moved to ${frlgMaps.find((mapEntry) => mapEntry.id === spot.targetMapId)?.title || 'next area'}.`);
      return;
    }

    if (spot.type === 'item') {
      setMapMessage(`Picked up ${spot.label}.`);
    }
  };

  const getHotspotClassName = (type) => {
    if (type === 'navigation') return 'mapHotspot mapHotspotNavigation';
    if (type === 'item') return 'mapHotspot mapHotspotItem';
    return 'mapHotspot mapHotspotTrainer';
  };

  return (
    <section className="mapsCard">
      <h2>Maps</h2>

      <div className="mapsMeta">
        <p>Current game profile: {game}</p>
        <p>Loaded save family: {saveVersion}</p>
        <p>Current area: {activeMap.title}</p>
        <p>{mapMessage}</p>
      </div>

      {saveVersion === 'FRLG' ? (
        <article key={activeMap.id} className="areaMapCard singleMapCard">
          <header>
            <h3>{activeMap.title}</h3>
            <p>{activeMap.subtitle}</p>
          </header>

          <div className="mapImageWrap" aria-label={`${activeMap.title} trainer map`}>
            <img
              src={activeMap.image}
              alt={`${activeMap.title} map`}
              className="mapImage"
              onError={(e) => {
                e.currentTarget.src = '/logo192.png';
              }}
            />

            {activeMap.hotspots.map((spot) => (
              <button
                key={`${spot.type}-${spot.label}-${spot.top}-${spot.left}`}
                type="button"
                className={getHotspotClassName(spot.type)}
                style={{ top: spot.top, left: spot.left }}
                title={spot.label}
                onClick={() => handleHotspotClick(spot)}
              >
                <span className="hotspotDot" aria-hidden="true" />
                <span className="hotspotLabel">{spot.label}</span>
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