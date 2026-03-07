import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';

import FileUpload from './components/FileUpload.js';
import TrainerInfo from './components/trainerinfo/TrainerInfo.js';
import PartyList from './components/pokemoninfo/PartyList.js';
import PCBoxes from './components/pokemoninfo/PCBoxes.js';
import Graveyard from './components/pokemoninfo/Graveyard.js';
import EncounterViewer from './components/encountertable/Encounters.js';
import Sidebar from './components/pokemoninfo/Sidebar.js';
import DamageCalcPanel from './components/damagecalculator/DamageCalc.js';
import LoginPage from './components/LoginPage.js';
import HomePage from './components/HomePage.js';
import ResetPasswordPage from './components/ResetPassword.js';
import SettingsPage from './components/Settings.js';
import MapsPage from './components/mapspage/MapsPage.js';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSetSelectedSave = (saveRow) => {
    setSelectedSave(saveRow);
    localStorage.setItem('selected_save', JSON.stringify(saveRow));
    
    if(saveRow.save_data){
      setData(saveRow.save_data);
      setGameFamily(saveRow.save_data.version);
      setGame(saveRow.save_data.version === "FRLG" ? "firered" : "emerald");
    }
    else{
      setData(null);
      setGameFamily(null);
      setGame(null);
    }
  };

  return (
    <>
      {!['/login', '/reset-password', '/home'].includes(location.pathname) && (
      <button
        type="button"
        className="globalMenuButton"
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        {isMenuOpen ? '✕ Close' : '☰ Menu'}
      </button>
      )}
      {!['/login', '/reset-password', '/home'].includes(location.pathname) && isMenuOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="menuBackdrop"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      {!['/login', '/reset-password', '/home'].includes(location.pathname) && (
      <nav className={`sideDrawer ${isMenuOpen ? 'open' : 'closed'}`}>
        <NavLink to="/trainer" onClick={() => setIsMenuOpen(false)}>Trainer Info</NavLink>
        <NavLink to="/pokemon" onClick={() => setIsMenuOpen(false)}>Pokémon Info</NavLink>
        <NavLink to="/damage" onClick={() => setIsMenuOpen(false)}>Damage Calc</NavLink>
        <NavLink to="/encounters" onClick={() => setIsMenuOpen(false)}>Encounters</NavLink>
        <NavLink to="/maps" onClick={() => setIsMenuOpen(false)}>Maps</NavLink>
        <NavLink to="/graveyard" onClick={() => setIsMenuOpen(false)}>Pokémon Graveyard</NavLink>
        <NavLink to="/settings" onClick={() => setIsMenuOpen(false)}>Settings</NavLink>
      </nav>
      )}

      <div className="App">
        <h1>Pokémon GBA Save Viewer</h1>
        {!user ? (
          <div className="loginButtonWrapper">
            {location.pathname === '/login' ? (
              <button onClick={() => navigate('/')}>Back</button>
            ) : (
              <button onClick={() => navigate('/login')}>Login</button>
            )}
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
          <Route
            path="/login"
            element={
              <LoginPage
                onLogin={(userObj) => {
                  localStorage.setItem('user', JSON.stringify(userObj.user));
                  localStorage.setItem('access_token', userObj.access_token);
                  setUser(userObj.user);
                  setToken(userObj.access_token);
                  navigate('/home');
                }}
              />
            }
          />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/home"
            element={
              <HomePage
                token={token}
                onSelectSave={(saveRow) => {
                  handleSetSelectedSave(saveRow);
                  navigate('/pokemon');
                }}
              />
            }
          />

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

                <div className="mainPanel">
                  <Routes>
                    <Route
                      path="/trainer"
                      element={data ? (
                        <TrainerInfo
                          trainer={data.trainer}
                          money={data.money}
                          version={data.version}
                          saveId={selectedSave?.id}
                          token={token}
                          setData={setData}
                        />
                      ) : <p>Upload a save file first.</p>}
                    />
                    <Route
                      path="/pokemon"
                      element={data ? (
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
                      ) : <p>Upload a save file first.</p>}
                    />
                    <Route
                      path="/graveyard"
                      element={data ? (
                        <Graveyard
                          party={data.party}
                          boxes={data.pc}
                          onCardClick={setSelectedPokemon}
                        />
                        ) : <p>Upload a save file first.</p>}
                    />
                    <Route
                      path="/encounters"
                      element={data ? <EncounterViewer game={game} party={data.party} pc={data.pc} /> : <p>Upload a save file first.</p>}
                    />
                    <Route
                      path="/damage"
                      element={data ? <DamageCalcPanel party={data.party} pc={data.pc} version={data.version} /> : <p>Upload a save file first.</p>}
                    />
                    <Route
                      path="/maps"
                      element={data ? <MapsPage game={game} saveVersion={data.version} /> : <p>Upload a save file first.</p>}
                    />
                    <Route
                      path="/settings"
                      element={data ? (
                        <SettingsPage
                          saveVersion={data.version}
                          gameFamily={gameFamily}
                          game={game}
                          onGameChange={setGame}
                        />
                      ) : <p>Upload a save file first.</p>}
                    />
                    <Route path="*" element={<p>{data ? 'Select a menu item from the left menu.' : 'Upload a save file first.'}</p>} />
                  </Routes>
                </div>
                {selectedPokemon && data && (
                  <Sidebar
                    pokemon={selectedPokemon}
                    closeSidebar={() => setSelectedPokemon(null)}
                    version={data.version}
                    saveId={selectedSave?.id}
                    token={token}
                    setData={setData}
                  />
                )}
              </>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
