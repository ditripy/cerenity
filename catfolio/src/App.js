import './App.css';
import { useState } from 'react';

function MainApp() {
  return (
    <div className="main-app">
      <h1>Catfolio 🐱</h1>
      <p>Collect cats. Learn money. Avoid scams.</p>
    </div>
  );
}

function Landing({ onStart }) {
  return (
    <div className="landing">
      <div className="title-container">
        <img src="assets/catfolio.png" alt="Catfolio Logo" className="animated-logo" />
        <img 
          src="assets/buttons/fish_start.png" 
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
  const [started, setStarted] = useState(false);

  return started ? <MainApp /> : <Landing onStart={() => setStarted(true)} />;
}

export default App;
