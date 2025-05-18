import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

import FileUpload from './components/FileUpload.js';
import TrainerInfo from './components/trainerinfo/TrainerInfo.js';
import PartyList from './components/pokemoninfo/PartyList.js';
import PCBoxes from './components/pokemoninfo/PCBoxes.js';
import EncounterViewer from './components/encountertable/Encounters.js';
import Sidebar from './components/pokemoninfo/Sidebar.js';
import DamageCalcPanel from './components/damagecalculator/DamageCalc.js';
import LoginPage from './components/LoginPage.js';
import HomePage from './components/HomePage.js';
import ResetPasswordPage from './components/ResetPassword.js';

import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('access_token'));

  const [selectedSave, setSelectedSave] = useState(() => {
    const stored = localStorage.getItem('selected_save');
    return stored ? JSON.parse(stored) : null;
  });

  const [data, setData] = useState(() => {
    const stored = localStorage.getItem('selected_save');
    return stored ? JSON.parse(stored)?.save_data : null;
  });

  const [gameFamily, setGameFamily] = useState(() => {
    const stored = localStorage.getItem('selected_save');
    const parsed = stored ? JSON.parse(stored) : null;
    return parsed?.save_data?.version || "FRLG";
  });

  const [game, setGame] = useState(() => {
    const stored = localStorage.getItem('selected_save');
    const parsed = stored ? JSON.parse(stored) : null;
    const version = parsed?.save_data?.version || "FRLG";
    return version === "FRLG" ? "firered" : "emerald";
  });

  const [selectedPokemon, setSelectedPokemon] = useState(null);

  const handleSetSelectedSave = (saveRow) => {
    setSelectedSave(saveRow);
    localStorage.setItem('selected_save', JSON.stringify(saveRow));
    setData(saveRow.save_data);
    setGameFamily(saveRow.save_data.version);
    setGame(saveRow.save_data.version === "FRLG" ? "firered" : "emerald");
  };

  return (
    <div className="App">
      <h1>Pokémon GBA Save Viewer</h1>

      {!user ? (
        <div className="loginButtonWrapper">
          <button onClick={() => navigate('/login')}>Login</button>
        </div>
      ) : (
        <div className="authControls">
          <p>Logged in as {user}</p>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('access_token');
              localStorage.removeItem('selected_save');
              setUser(null);
              setToken(null);
              setData(null);
              setSelectedSave(null);
              navigate('/');
            }}
          >
            Log out
          </button>
          {location.pathname !== '/home' && (
            <button onClick={() => navigate('/home')}>Back to Home</button>
          )}
        </div>
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
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/home"
          element={<HomePage
            token={token}
            onSelectSave={(saveRow) => {
              handleSetSelectedSave(saveRow);
              navigate('/pokemon');
            }}
          />}
        />

        {/* Main App Layout */}
        <Route
          path="/*"
          element={
            <>
              <div className="fileUploadwrapper">
                <FileUpload
                  saveId={selectedSave?.id || null}
                  token={token}
                  onUpload={(parsed) => {
                    handleSetSelectedSave({ id: null, save_data: parsed });
                  }}
                  saveData={data}
                />
              </div>

              {data && (
                <>
                  <nav>
                    <Link to="/trainer">Trainer Info</Link>
                    <Link to="/pokemon">Pokémon Info</Link>
                    <Link to="/damage">Damage Calc</Link>
                    <Link to="/encounters">Encounters</Link>
                  </nav>

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
                </>
              )}

              <Routes>
                <Route
                  path="/trainer"
                  element={
                    data ? (
                      <TrainerInfo
                        trainer={data.trainer}
                        money={data.money}
                        version={data.version}
                        saveId={selectedSave?.id}
                        token={token}
                      />
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
                        <PartyList
                          party={data.party}
                          onCardClick={setSelectedPokemon}
                          version={data.version}
                        />
                        <PCBoxes
                          boxes={data.pc}
                          onCardClick={setSelectedPokemon}
                          version={data.version}
                        />
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
                      <EncounterViewer
                        game={game}
                        party={data.party}
                        pc={data.pc}
                      />
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
                <Sidebar
                  pokemon={selectedPokemon}
                  closeSidebar={() => setSelectedPokemon(null)}
                  version={data.version}
                  saveId={selectedSave?.id}
                  token={token}
                />
              )}
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
