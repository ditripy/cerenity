import './App.css';
import { useState, useEffect, useRef } from 'react';
import catfolioLogo from './assets/catfolio.png';
import fishStartButton from './assets/buttons/fish_start.png';
import bgMusic from './assets/sounds/bgmusic.wav';
import SpendingSorter from './components/SpendingSorter';

function MainApp({ onBack, onNavigateToGame }) {
  return (
    <div className="main-app">
      <button className="back-button" onClick={onBack}>← Back to Start</button>
      <h1>Catfolio 🐱</h1>
      <p>Collect cats. Learn money. Avoid scams.</p>
      <div className="minigames-menu">
        <h2>Mini Games</h2>
        <div className="game-buttons">
          <button className="game-button" onClick={() => onNavigateToGame('spending-sorter')}>
            🐱💰 Spending Sorter
            <small>Learn budgeting basics!</small>
          </button>
        </div>
      </div>
    </div>
  );
}

function Landing({ onStart }) {
  const [volume, setVolume] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.play().catch(e => console.log('Audio autoplay prevented:', e));
    }
  }, [volume]);

  return (
    <div className="landing">
      <audio ref={audioRef} loop>
        <source src={bgMusic} type="audio/wav" />
      </audio>
      
      <div className="settings-button" onClick={() => setShowSettings(!showSettings)}>
        ⚙️
      </div>
      
      {showSettings && (
        <div className="settings-panel">
          <h3>Settings</h3>
          <label>
            Volume: {Math.round(volume * 100)}%
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </label>
          <button onClick={() => setShowSettings(false)}>Close</button>
        </div>
      )}
      
      <div className="title-container">
        <img src={catfolioLogo} alt="Catfolio Logo" className="animated-logo" />
        <img 
          src={fishStartButton} 
          alt="Start Game" 
          className="start-button-img" 
          onClick={onStart}
          style={{cursor: 'pointer'}}
        />
      </div>
    </div>
  );
}

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing'); // landing, main, spending-sorter

  // Handle hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'spending-sorter') {
        setCurrentScreen('spending-sorter');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const goToMain = () => {
    setCurrentScreen('main');
    window.location.hash = '';
  };

  const goToLanding = () => {
    setCurrentScreen('landing');
    window.location.hash = '';
  };

  const goToSpendingSorter = () => {
    setCurrentScreen('spending-sorter');
    window.location.hash = 'spending-sorter';
  };

  if (currentScreen === 'spending-sorter') {
    return <SpendingSorter onBack={() => setCurrentScreen('main')} />;
  }

  if (currentScreen === 'main') {
    return <MainApp onBack={goToLanding} onNavigateToGame={setCurrentScreen} />;
  }

  return <Landing onStart={goToMain} />;
}

export default App;
