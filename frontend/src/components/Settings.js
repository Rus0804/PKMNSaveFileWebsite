import React, { useState } from 'react';
import './Settings.css';

function SettingsPage({ saveVersion, gameFamily, game, onGameChange }) {
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  return (
    <section className="settingsCard">
      <h2>Settings</h2>
      <p>Adjust a few viewer preferences for your active save.</p>

      <div className="settingRow">
        <label htmlFor="version-select">Game Version:</label>
        <select id="version-select" value={game} onChange={(e) => onGameChange(e.target.value)}>
          {gameFamily === 'FRLG' ? (
            <>
              <option value="firered">FireRed</option>
              <option value="leafgreen">LeafGreen</option>
            </>
          ) : (
            <>
              <option value="ruby">Ruby</option>
              <option value="sapphire">Sapphire</option>
              <option value="emerald">Emerald</option>
            </>
          )}
        </select>
      </div>

      <div className="settingRow">
        <span>Show advanced details:</span>
        <button
          type="button"
          onClick={() => setShowAdvancedDetails((current) => !current)}
        >
          {showAdvancedDetails ? 'On' : 'Off'}
        </button>
      </div>

      <div className="settingsMeta">
        <p>Loaded save family: {saveVersion}</p>
        <p>Advanced details: {showAdvancedDetails ? 'enabled' : 'disabled'}</p>
      </div>
    </section>
  );
}

export default SettingsPage;
