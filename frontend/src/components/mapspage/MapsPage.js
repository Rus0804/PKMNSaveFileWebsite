import React from 'react';
import './MapsPage.css';

function MapsPage({ game, saveVersion }) {
  return (
    <section className="mapsCard">
      <h2>Maps</h2>
      <p>Basic map tools are now available from this tab.</p>

      <div className="mapsMeta">
        <p>Current game profile: {game}</p>
        <p>Loaded save family: {saveVersion}</p>
      </div>

      <div className="mapsPlaceholder">
        Map browser coming soon.
      </div>
    </section>
  );
}

export default MapsPage;
