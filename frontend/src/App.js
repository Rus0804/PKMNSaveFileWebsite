import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import FileUpload from './components/FileUpload.js';
import TrainerInfo from './components/TrainerInfo.js';
import PartyList from './components/PartyList.js';
import PCBoxes from './components/PCBoxes.js';
import EncounterViewer from './components/Encounters.js';
import Sidebar from './components/Sidebar.js';
import DamageCalcPanel from './components/DamageCalc.js';
import LoginPage from './components/LoginPage.js';
import HomePage from './components/HomePage.js';

import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [selectedSave, setSelectedSave] = useState(null); // full save row
  const [data, setData] = useState(null);
  const [gameFamily, setGameFamily] = useState("FRLG");
  const [game, setGame] = useState("firered");
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  useEffect(() => {
    if (!selectedSave || !selectedSave.save_data) return;
    setData(selectedSave.save_data);
    setGameFamily(selectedSave.save_data.version);
    setGame(selectedSave.save_data.version === "FRLG" ? "firered" : "emerald");
  }, [selectedSave]);

  if (!user || !token) {
    return (
      <LoginPage
        onLogin={(userObj) => {
          localStorage.setItem('user', JSON.stringify(userObj.user));
          localStorage.setItem('access_token', userObj.access_token);
          setUser(userObj.user);
          setToken(userObj.access_token);
        }}
      />
    );
  }

  if (!selectedSave) {
    return (
      <HomePage
        token={token}
        onSelectSave={(saveRow) => {
          setSelectedSave(saveRow);
          setData(null); // reset
        }}
      />
    );
  }

  return (
    <Router>
      <div className="App">
        <h1>Pokémon GBA Save Viewer</h1>
        <p>
          Logged in as {user}
          <button
            onClick={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('access_token');
              setUser(null);
              setToken(null);
              setSelectedSave(null);
              setData(null);
            }}
            style={{ marginLeft: '1rem' }}
          >
            Log out
          </button>
          <button
            onClick={() => {
              setSelectedSave(null);
              setData(null);
            }}
            style={{ marginLeft: '1rem' }}
          >
            Back to Saves
          </button>
        </p>

        
        <FileUpload
          saveId={selectedSave.id}
          token={token}
          onUpload={(parsed) => {
            setData(parsed);
            setGameFamily(parsed.version);
            setGame(parsed.version === "FRLG" ? "firered" : "emerald");
          }}
        />
        

        {data && (
          <>
            <div style={{ margin: '1rem 0' }}>
              <label htmlFor="version-select" style={{ marginRight: '0.5rem' }}>
                Game Version:
              </label>
              <select
                id="version-select"
                value={game}
                onChange={(e) => setGame(e.target.value)}
              >
                {gameFamily === "FRLG" && (
                  <>
                    <option value="firered">FireRed</option>
                    <option value="leafgreen">LeafGreen</option>
                  </>
                )}
                {gameFamily === "RSE" && (
                  <>
                    <option value="ruby">Ruby</option>
                    <option value="sapphire">Sapphire</option>
                    <option value="emerald">Emerald</option>
                  </>
                )}
              </select>
            </div>

            <nav style={{ marginBottom: '1rem' }}>
              <Link to="/trainer" style={{ marginRight: '1rem' }}>Trainer Info</Link>
              <Link to="/pokemon" style={{ marginRight: '1rem' }}>Pokémon Info</Link>
              <Link to="/damage" style={{ marginRight: '1rem' }}>Damage Calc</Link>
              <Link to="/encounters">Encounters</Link>
            </nav>
          </>
        )}

        <Routes>
          <Route path="/trainer" element={
            data ? (
              <TrainerInfo
                trainer={data.trainer}
                money={data.money}
                version={data.version}
              />
            ) : <p>Upload or select a save file first.</p>
          } />

          <Route path="/pokemon" element={
            data ? (
              <>
                <PartyList party={data.party} onCardClick={setSelectedPokemon} />
                <PCBoxes boxes={data.pc} onCardClick={setSelectedPokemon} />
              </>
            ) : <p>Upload or select a save file first.</p>
          } />

          <Route path="/encounters" element={
            data ? (
              <EncounterViewer game={game} party={data.party} pc={data.pc} />
            ) : <p>Upload or select a save file first.</p>
          } />

          <Route path="/damage" element={
            data ? (
              <DamageCalcPanel party={data.party} pc={data.pc} />
            ) : <p>Upload or select a save file first.</p>
          } />
        </Routes>

        {selectedPokemon && (
          <Sidebar pokemon={selectedPokemon} closeSidebar={() => setSelectedPokemon(null)} />
        )}
      </div>
    </Router>
  );
}

export default App;
