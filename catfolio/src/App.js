import './App.css';
import { useState, useEffect, useRef } from 'react';
import catfolioLogo from './assets/catfolio.png';
import fishStartButton from './assets/buttons/fish_start.png';
import bgMusic from './assets/sounds/bgmusic.wav';
import backgroundKnock from './assets/bg/background_knock.png';
import backgroundReveal from './assets/bg/background_reveal.jpg';
import knockImg from './assets/knock.png';
import knockSound from './assets/sounds/knock.wav';
import tadaSound from './assets/sounds/tada.wav';
import catShadow from './assets/2_shadow.png';
import catFull from './assets/cats/2.png';
import questionImg from './assets/question.png';
import pennyImg from './assets/Penny.png';
import scamCatShadow from './assets/8_shadow.png';
import scamCatFull from './assets/cats/8.png';
import shadyImg from './assets/Shady.png';
import SpendingSorter from './minigame/SpendingSorter';
import ScamCatGame from './minigame/ScamCat';

function KnockScreen({ onComplete }) {
  const [knocksVisible, setKnocksVisible] = useState([false, false, false]);
  const [fadeIn, setFadeIn] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Fade in the screen
    setFadeIn(true);

    // Play knock sound starting at 2 seconds
    if (audioRef.current) {
      audioRef.current.currentTime = 2.0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    // First knock appears after 0.5s
    const timer1 = setTimeout(() => {
      setKnocksVisible([true, false, false]);
    }, 500);

    // Second knock appears after 1s
    const timer2 = setTimeout(() => {
      setKnocksVisible([true, true, false]);
    }, 1000);

    // Third knock appears after 1.5s
    const timer3 = setTimeout(() => {
      setKnocksVisible([true, true, true]);
    }, 1500);

    // Auto advance to main screen after 3.5s (1.5s + 2s wait)
    const timer4 = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const knockStyles = [
    // Top knock - lean left
    {
      position: 'absolute',
      top: '10%',
      left: '30%',
      transform: 'rotate(-15deg)',
      width: '250px',
      height: '250px'
    },
    // Middle knock - lean right
    {
      position: 'absolute',
      top: '35%',
      left: '55%',
      transform: 'rotate(15deg)',
      width: '250px',
      height: '250px'
    },
    // Bottom knock - lean left
    {
      position: 'absolute',
      top: '60%',
      left: '35%',
      transform: 'rotate(-12deg)',
      width: '250px',
      height: '250px'
    }
  ];

  return (
    <div 
      className="knock-screen" 
      style={{ 
        backgroundImage: `url(${backgroundKnock})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        position: 'relative',
        cursor: 'pointer',
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 0.8s ease-in-out'
      }} 
      onClick={onComplete}
    >
      <audio ref={audioRef}>
        <source src={knockSound} type="audio/wav" />
      </audio>
      {knocksVisible.map((visible, index) => (
        <img 
          key={index}
          src={knockImg} 
          alt={`Knock ${index + 1}`}
          style={{
            ...knockStyles[index],
            objectFit: 'contain',
            opacity: visible ? 1 : 0,
            transform: visible ? knockStyles[index].transform : `${knockStyles[index].transform} scale(0.5)`,
            transition: 'all 0.3s ease-out'
          }}
        />
      ))}
    </div>
  );
}

function RevealScreen({ onComplete }) {
  const [fadeIn, setFadeIn] = useState(false);
  const [showShadow, setShowShadow] = useState(true);
  const [catFadeIn, setCatFadeIn] = useState(false);
  const [shadowOpacity, setShadowOpacity] = useState(1);
  const [fullOpacity, setFullOpacity] = useState(0);
  const [questionOpacity, setQuestionOpacity] = useState(1);
  const [pennyOpacity, setPennyOpacity] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Fade in the screen
    setFadeIn(true);
    
    // Play tada sound immediately
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    
    // Fade in the shadow cat
    setTimeout(() => setCatFadeIn(true), 100);

    // Replace shadow with full image after 2 seconds
    const shadowTimer = setTimeout(() => {
      setShadowOpacity(0);
      setFullOpacity(1);
      setQuestionOpacity(0);
      setPennyOpacity(1);
      setShowShadow(false);
    }, 2000);

    // Auto advance after 7 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 7000);

    return () => {
      clearTimeout(shadowTimer);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div 
      className="reveal-screen" 
      style={{ 
        backgroundImage: `url(${backgroundReveal})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        position: 'relative',
        cursor: 'pointer'
      }} 
      onClick={onComplete}
    >
      <audio ref={audioRef}>
        <source src={tadaSound} type="audio/wav" />
      </audio>
      <img 
        src={catShadow}
        alt="Cat shadow"
        style={{
          position: 'absolute',
          left: '13%',
          top: '42%',
          transform: 'translateY(-50%)',
          width: '300px',
          height: '300px',
          objectFit: 'contain',
          opacity: catFadeIn ? shadowOpacity : 0,
          transition: 'opacity 0.8s ease-in-out',
          pointerEvents: 'none'
        }}
      />
      <img 
        src={catFull}
        alt="Cat reveal"
        style={{
          position: 'absolute',
          left: '13%',
          top: '42%',
          transform: 'translateY(-50%)',
          width: '300px',
          height: '300px',
          objectFit: 'contain',
          opacity: fullOpacity,
          transition: 'opacity 0.8s ease-in-out',
          pointerEvents: 'none'
        }}
      />
      <img 
        src={questionImg}
        alt="Question"
        style={{
          position: 'absolute',
          right: '13%',
          top: '42%',
          transform: 'translateY(-50%) skewY(-5deg)',
          width: '350px',
          height: '350px',
          objectFit: 'contain',
          opacity: catFadeIn ? questionOpacity : 0,
          transition: 'opacity 0.8s ease-in-out',
          pointerEvents: 'none'
        }}
      />
      <img 
        src={pennyImg}
        alt="Penny reveal"
        style={{
          position: 'absolute',
          right: '10%',
          top: '42%',
          transform: 'translateY(-50%)',
          width: '450px',
          height: '450px',
          objectFit: 'contain',
          opacity: pennyOpacity,
          transition: 'opacity 0.8s ease-in-out',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '18%',
          top: 'calc(42% + 80px)',
          transform: 'translateX(50%)',
          fontSize: '42px',
          fontWeight: 'bold',
          color: '#5d4037',
          textShadow: '2px 2px 4px rgba(234, 224, 224, 0.5)',
          opacity: pennyOpacity,
          transition: 'opacity 0.8s ease-in-out',
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        a.k.a Budget Whiskers
      </div>
    </div>
  );
}

function RevealScreenScamCat({ onComplete }) {
  const [fadeIn, setFadeIn] = useState(false);
  const [showShadow, setShowShadow] = useState(true);
  const [catFadeIn, setCatFadeIn] = useState(false);
  const [shadowOpacity, setShadowOpacity] = useState(1);
  const [fullOpacity, setFullOpacity] = useState(0);
  const [questionOpacity, setQuestionOpacity] = useState(1);
  const [shadyOpacity, setShadyOpacity] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Fade in the screen
    setFadeIn(true);
    
    // Play tada sound immediately
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    
    // Fade in the shadow cat
    setTimeout(() => setCatFadeIn(true), 100);

    // Replace shadow with full image after 2 seconds
    const shadowTimer = setTimeout(() => {
      setShadowOpacity(0);
      setFullOpacity(1);
      setQuestionOpacity(0);
      setShadyOpacity(1);
      setShowShadow(false);
    }, 2000);

    // Auto advance after 7 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 7000);

    return () => {
      clearTimeout(shadowTimer);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div 
      className="reveal-screen" 
      style={{ 
        backgroundImage: `url(${backgroundReveal})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        position: 'relative',
        cursor: 'pointer'
      }} 
      onClick={onComplete}
    >
      <audio ref={audioRef}>
        <source src={tadaSound} type="audio/wav" />
      </audio>
      <img 
        src={scamCatShadow}
        alt="Cat shadow"
        style={{
          position: 'absolute',
          left: '13%',
          top: '42%',
          transform: 'translateY(-50%)',
          width: '300px',
          height: '300px',
          objectFit: 'contain',
          opacity: catFadeIn ? shadowOpacity : 0,
          transition: 'opacity 0.8s ease-in-out',
          pointerEvents: 'none'
        }}
      />
      <img 
        src={scamCatFull}
        alt="Cat reveal"
        style={{
          position: 'absolute',
          left: '13%',
          top: '42%',
          transform: 'translateY(-50%)',
          width: '300px',
          height: '300px',
          objectFit: 'contain',
          opacity: fullOpacity,
          transition: 'opacity 0.8s ease-in-out',
          pointerEvents: 'none'
        }}
      />
      <img 
        src={questionImg}
        alt="Question"
        style={{
          position: 'absolute',
          right: '13%',
          top: '42%',
          transform: 'translateY(-50%) skewY(-5deg)',
          width: '350px',
          height: '350px',
          objectFit: 'contain',
          opacity: catFadeIn ? questionOpacity : 0,
          transition: 'opacity 0.8s ease-in-out',
          pointerEvents: 'none'
        }}
      />
      <img 
        src={shadyImg}
        alt="Shady reveal"
        style={{
          position: 'absolute',
          right: '10%',
          top: '42%',
          transform: 'translateY(-50%)',
          width: '450px',
          height: '450px',
          objectFit: 'contain',
          opacity: shadyOpacity,
          transition: 'opacity 0.8s ease-in-out',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '18%',
          top: 'calc(42% + 80px)',
          transform: 'translateX(50%)',
          fontSize: '42px',
          fontWeight: 'bold',
          color: '#5d4037',
          textShadow: '2px 2px 4px rgba(234, 224, 224, 0.5)',
          opacity: shadyOpacity,
          transition: 'opacity 0.8s ease-in-out',
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        a.k.a Whisker Swindle
      </div>
    </div>
  );
}

function MainApp({ onBack, onNavigateToGame }) {
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('gameVolume');
    return saved ? parseInt(saved) / 100 : 0.5;
  });
  const [showSettings, setShowSettings] = useState(false);
  const audioRef = useRef(null);

  // Auto-play on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.play().catch(e => console.log('Audio autoplay prevented:', e));
    }
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem('gameVolume', Math.round(volume * 100));
  }, [volume]);

  return (
    <div className="main-app">
      <audio ref={audioRef} loop>
        <source src={bgMusic} type="audio/wav" />
      </audio>

      <div className="settings-button" onClick={() => setShowSettings(!showSettings)}>
        ⚙️
      </div>

      {showSettings && (
        <div className="settings-panel">
          <label>Volume</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="volume-slider"
          />
          <span>{Math.round(volume * 100)}%</span>
        </div>
      )}

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
          <button className="game-button" onClick={() => onNavigateToGame('scam-cat')}>
            🐱🕵️‍♂️ Scam Cat
            <small>Spot scams & protect your tuna!</small>
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

  // Try auto-play on mount and any interaction
  useEffect(() => {
    const tryPlay = () => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
        audioRef.current.play().catch(e => {
          // Autoplay blocked, will play on first user interaction
        });
      }
    };

    tryPlay();
    
    // Try to play on any user interaction
    const interactions = ['click', 'touchstart', 'keydown'];
    interactions.forEach(event => {
      document.addEventListener(event, tryPlay, { once: true });
    });

    return () => {
      interactions.forEach(event => {
        document.removeEventListener(event, tryPlay);
      });
    };
  }, []);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
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
  const [currentScreen, setCurrentScreen] = useState('landing'); // landing, knock, main, reveal-spending, spending-sorter, reveal-scamcat, scam-cat
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'spending-sorter') setCurrentScreen('reveal-spending');
      if (hash === 'scam-cat') setCurrentScreen('reveal-scamcat');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const goToKnock = () => {
    setCurrentScreen('knock');
    window.location.hash = '';
  };

  const goToMain = () => {
    setCurrentScreen('main');
    window.location.hash = '';
  };

  const goToLanding = () => {
    setCurrentScreen('landing');
    window.location.hash = '';
  };

  const goToRevealSpending = () => {
    setCurrentScreen('reveal-spending');
    window.location.hash = 'spending-sorter';
  };

  const goToSpendingSorter = () => {
    setCurrentScreen('spending-sorter');
    window.location.hash = 'spending-sorter';
  };

  const goToRevealScamCat = () => {
    setCurrentScreen('reveal-scamcat');
    window.location.hash = 'scam-cat';
  };

  const goToScamCat = () => {
    setCurrentScreen('scam-cat');
    window.location.hash = 'scam-cat';
  };

  if (currentScreen === 'reveal-spending') {
    return (
      <div style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        <RevealScreen onComplete={goToSpendingSorter} />
      </div>
    );
  }

  if (currentScreen === 'spending-sorter') {
    return (
      <div style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        <SpendingSorter onBack={() => setCurrentScreen('main')} />
      </div>
    );
  }

  if (currentScreen === 'reveal-scamcat') {
    return (
      <div style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        <RevealScreenScamCat onComplete={goToScamCat} />
      </div>
    );
  }

  if (currentScreen === 'scam-cat') {
    return (
      <div style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        <ScamCatGame onBack={() => setCurrentScreen('main')} />
      </div>
    );
  }

  if (currentScreen === 'knock') {
    return (
      <div style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        <KnockScreen onComplete={goToMain} />
      </div>
    );
  }

  if (currentScreen === 'main') {
    const handleNavigateToGame = (game) => {
      if (game === 'spending-sorter') {
        goToRevealSpending();
      } else if (game === 'scam-cat') {
        goToRevealScamCat();
      } else {
        setCurrentScreen(game);
      }
    };
    return (
      <div style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        <MainApp onBack={goToLanding} onNavigateToGame={handleNavigateToGame} />
      </div>
    );
  }

  return (
    <div style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
      <Landing onStart={goToKnock} />
    </div>
  );
}

export default App;
