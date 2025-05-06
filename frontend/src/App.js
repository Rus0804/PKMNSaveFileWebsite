import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

import FileUpload from './components/FileUpload.js';
import TrainerInfo from './components/TrainerInfo.js';
import PartyList from './components/PartyList.js';
import PCBoxes from './components/PCBoxes.js';
import EncounterViewer from './components/Encounters.js';
import Sidebar from './components/Sidebar.js';
import DamageCalcPanel from './components/DamageCalc.js';
import LoginPage from './components/LoginPage.js';
import HomePage from './components/HomePage.js'

import './App.css';

function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [selectedSave, setSelectedSave] = useState(null);
  const [data, setData] = useState(null);
  const [gameFamily, setGameFamily] = useState("FRLG");
  const [game, setGame] = useState("firered");
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  useEffect(() => {
    if (selectedSave?.save_data) {
      setData(selectedSave.save_data);
      setGameFamily(selectedSave.save_data.version);
      setGame(selectedSave.save_data.version === "FRLG" ? "firered" : "emerald");
    }
  }, [selectedSave]);

  return (
    <div className="App">
      <h1>Pokémon GBA Save Viewer</h1>

      {!user ? (
        <button onClick={() => navigate('/login')}>
          Login
        </button>
      ) : (
        <p>
          Logged in as {user}
          <button
            onClick={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('access_token');
              setUser(null);
              setToken(null);
              setSelectedSave(null);
              navigate('/');
            }}
          >
            Log out
          </button>
        </p>
      )}

      <Routes>
        {/* Login and Home Page */}
        <Route
          path="/login"
          element={<LoginPage
            onLogin={(userObj) => {
              localStorage.setItem('user', JSON.stringify(userObj.user));
              localStorage.setItem('access_token', userObj.access_token);
              setUser(userObj.user);
              setToken(userObj.access_token);
              navigate('/home');
            }}
          />}
        />
        <Route
          path="/home"
          element={<HomePage
            token={token}
            onSelectSave={(saveRow) => {
              setSelectedSave(saveRow);
              setData(null); 
              navigate('/')
            }}
          />}
        />

        {/* Main App Layout for authenticated users */}
        <Route
          path="/*"
          element={
            <>
              <FileUpload
                saveId={selectedSave?.id || null}
                token={token}
                onUpload={(parsed) => {
                  setSelectedSave({ id: null, save_data: parsed });
                }}
              />

              {data && (
                <>
                  <div className="versionSelect">
                    <label htmlFor="version-select">Game Version:</label>
                    <select
                      id="version-select"
                      value={game}
                      onChange={(e) => setGame(e.target.value)}
                    >
                      {gameFamily === "FRLG" ? (
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

                  <nav>
                    <Link to="/trainer">Trainer Info</Link>
                    <Link to="/pokemon">Pokémon Info</Link>
                    <Link to="/damage">Damage Calc</Link>
                    <Link to="/encounters">Encounters</Link>
                  </nav>
                </>
              )}

              <Routes>
                <Route
                  path="/trainer"
                  element={
                    data ? (
                      <TrainerInfo trainer={data.trainer} money={data.money} version={data.version} />
                    ) : (
                      <p>Upload a save file first.</p>
                    )
                  }
                />
                <Route
                  path="/pokemon"
                  element={
                    data ? (
                      <>
                        <PartyList party={data.party} onCardClick={setSelectedPokemon} />
                        <PCBoxes boxes={data.pc} onCardClick={setSelectedPokemon} />
                      </>
                    ) : (
                      <p>Upload a save file first.</p>
                    )
                  }
                />
                <Route
                  path="/encounters"
                  element={
                    data ? (
                      <EncounterViewer game={game} party={data.party} pc={data.pc} />
                    ) : (
                      <p>Upload a save file first.</p>
                    )
                  }
                />
                <Route
                  path="/damage"
                  element={
                    data ? (
                      <DamageCalcPanel party={data.party} pc={data.pc} />
                    ) : (
                      <p>Upload a save file first.</p>
                    )
                  }
                />
              </Routes>

              {selectedPokemon && (
                <Sidebar pokemon={selectedPokemon} closeSidebar={() => setSelectedPokemon(null)} />
              )}
            </>
          }
        />
      
      </Routes>
    </div>
  );
}

export default App;
