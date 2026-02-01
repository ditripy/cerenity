import React, { useState, useEffect, useRef } from 'react';
import './style/ScamCat.css';
import backgroundBudget from '../assets/bg/background_budget.png';
import budgetGameBg from '../assets/sounds/badcatmusic.wav';
import headerImg from "../assets/scambanner.png";
import noteImg from '../assets/spendingSorter/note.png';

// Pool of message cards
const MESSAGE_POOL = [
  {
    id: 1,
    text: "URGENT: Your account will be suspended in 24 hours! Click here immediately to verify your identity.",
    isScam: true,
    explanation: "⚠️ SCAM! Red flags: Creates false urgency, threatens account suspension, and demands immediate action. Legitimate companies don't operate this way."
  },
  {
    id: 2,
    text: "Hi! Your package delivery is scheduled for tomorrow between 2-4 PM. Track it here: [tracking link]",
    isScam: false,
    explanation: "✅ SAFE! This is a normal delivery notification with expected information and no pressure tactics."
  },
  {
    id: 3,
    text: "You've WON $5,000! Claim your prize now by providing your bank details!",
    isScam: true,
    explanation: "⚠️ SCAM! You can't win something you didn't enter. Requests for bank details are a massive red flag."
  },
  {
    id: 4,
    text: "Your subscription renewal is coming up next week. No action needed - we'll charge your card on file.",
    isScam: false,
    explanation: "✅ SAFE! Transparent notification about an upcoming charge with no urgent demands or suspicious links."
  },
  {
    id: 5,
    text: "FINAL WARNING! IRS has filed a lawsuit against you. Call this number NOW to avoid arrest!",
    isScam: true,
    explanation: "⚠️ SCAM! The IRS never threatens arrest via text/email. This uses fear tactics and fake authority."
  },
  {
    id: 6,
    text: "Hey, it's mom. My phone broke. This is my new number. Can you send me $200 for groceries?",
    isScam: true,
    explanation: "⚠️ SCAM! Classic impersonation scam. Always verify identity through a known channel before sending money."
  },
  {
    id: 7,
    text: "Your order #12345 has shipped. Estimated delivery: Friday. Reply STOP to unsubscribe.",
    isScam: false,
    explanation: "✅ SAFE! Clear order reference, realistic delivery info, and includes opt-out option."
  },
  {
    id: 8,
    text: "Security Alert: We detected suspicious activity. Reset your password here: [suspicious-link].com",
    isScam: true,
    explanation: "⚠️ SCAM! Fake security alerts with suspicious links are common phishing tactics. Always go directly to the official website."
  },
  {
    id: 9,
    text: "You're pre-approved for a $50,000 loan! No credit check required! Apply now!",
    isScam: true,
    explanation: "⚠️ SCAM! 'No credit check' and 'pre-approved' for huge amounts are classic loan scam tactics."
  },
  {
    id: 10,
    text: "Your appointment with Dr. Smith is confirmed for Tuesday at 3 PM. Location: 123 Main St.",
    isScam: false,
    explanation: "✅ SAFE! Specific details about a scheduled appointment with clear information."
  },
  {
    id: 11,
    text: "Netflix: Your payment method was declined. Update it within 48 hours to avoid service interruption.",
    isScam: true,
    explanation: "⚠️ SCAM! Even if you have Netflix, scammers send these hoping to catch someone. Always check your account directly, not through links."
  },
  {
    id: 12,
    text: "Hi! Your prescription is ready for pickup at Pharmacy on 5th Ave. Bring your ID.",
    isScam: false,
    explanation: "✅ SAFE! Routine pickup notification with reasonable requirements."
  },
  {
    id: 13,
    text: "FREE IPHONE 15! You've been selected as our lucky winner! Just pay $9.95 shipping!",
    isScam: true,
    explanation: "⚠️ SCAM! Nothing is free. The 'shipping fee' scam is designed to steal credit card information."
  },
  {
    id: 14,
    text: "Your credit score has changed. Log in to your account to see the update.",
    isScam: false,
    explanation: "✅ SAFE! Standard notification directing you to log in yourself rather than providing a suspicious link."
  },
  {
    id: 15,
    text: "BREAKING: Your social security number was used in Texas! Federal Agent John will call you. DO NOT IGNORE!",
    isScam: true,
    explanation: "⚠️ SCAM! Social Security Administration doesn't contact people this way. Scare tactics and fake officials are red flags."
  }
];

function ScamCat({ onBack }) {
  const [gameState, setGameState] = useState('instructions');
  const [attempts, setAttempts] = useState(3);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [cards, setCards] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [cardExiting, setCardExiting] = useState(false);
  
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('gameVolume');
    return saved !== null ? parseFloat(saved) : 50;
  });
  const [showSettings, setShowSettings] = useState(false);
  const timerRef = useRef(null);

  /* =============================
     AUDIO HANDLING
  ============================= */
  // Auto-play background music on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  }, []);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Update localStorage when volume changes
  useEffect(() => {
    localStorage.setItem('gameVolume', volume.toString());
  }, [volume]);

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  /* =============================
     GAME START
  ============================= */
  const startGame = () => {
    const shuffled = [...MESSAGE_POOL].sort(() => Math.random() - 0.5);
    setCards(shuffled.slice(0, 5));
    setCardIndex(0);
    setTimeLeft(15);
    setTimerActive(true);
    setGameState('playing');
    setShowFeedback(false);
  };

  /* =============================
     TIMER
  ============================= */
  useEffect(() => {
    if (timerActive && timeLeft > 0 && gameState === 'playing' && !showFeedback) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && timerActive) {
      handleAnswer(null);
    }

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, timerActive, showFeedback, gameState]);

  /* =============================
     ANSWER LOGIC
  ============================= */
  const handleAnswer = (answer) => {
    setTimerActive(false);
    const card = cards[cardIndex];

    const correct =
      answer !== null &&
      ((answer === 'scam' && card.isScam) ||
       (answer === 'safe' && !card.isScam));

    setLastAnswer(answer);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setTimeout(handleCorrectPhase1, 2200);
    } else {
      setTimeout(handleWrong, 3000);
    }
  };

  const handleWrong = () => {
    setShowFeedback(false);
    setAttempts(prev => prev - 1);

    if (attempts - 1 <= 0) {
      setGameState('failed');
    } else {
      setCurrentAttempt(prev => prev + 1);
      setGameState('instructions');
    }
  };

  const handleCorrectPhase1 = () => {
    setShowFeedback(false);
    setCardExiting(true);
    setTimeout(handleCorrectPhase2, 400);
  };

  const handleCorrectPhase2 = () => {
    setCardExiting(false);
    if (cardIndex + 1 < cards.length) {
      setCardIndex(prev => prev + 1);
      setTimeLeft(15);
      setTimerActive(true);
    } else {
      setGameState('success');
    }
  };

  const resetGame = () => {
    setAttempts(3);
    setCurrentAttempt(1);
    setCards([]);
    setCardIndex(0);
    setTimeLeft(15);
    setTimerActive(false);
    setGameState('instructions');
  };

  const card = cards[cardIndex];
  const progress = (cardIndex / cards.length) * 100;

  return (
    <div className="spending-sorter" style={{ backgroundImage: `url(${backgroundBudget})` }}>
      <audio ref={audioRef} loop>
        <source src={budgetGameBg} type="audio/mpeg" />
      </audio>
      <div className="background-overlay"></div>
      
      <div className="game-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="header-controls">
          <div className="attempt-display">Round: {currentAttempt}/3</div>
          <div className="hearts-display">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={i < attempts ? 'heart-full' : 'heart-empty'}>
                {i < attempts ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
          <button className="settings-button" onClick={() => setShowSettings(!showSettings)}>⚙️</button>
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <label>Volume: {volume}%</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
      )}

      <div className="game-area">
        {/* Game Info Panel */}
        <div className="budget-info-panel">
          <div className="budget-left">
            <div className="budget-instructions">
              <div>🕵️ Spot the SCAM or SAFE messages!</div>
              <div>Don't let the shady cat trick you!</div>
            </div>
          </div>
          <div className="budget-right" style={{ backgroundImage: `url(${noteImg})` }}>
            <div>⏱️ 15 seconds per message</div>
            <div>❌ Wrong = Lose 1 life</div>
            <div>🎯 Get 5 correct to win!</div>
          </div>
        </div>

        {/* Main Game Content - Centered */}
        {gameState === 'playing' && card && (
          <div className="scam-game-container">
            {/* Progress & Timer Container */}
            <div className="progress-timer-container">
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                <span className="progress-text">Message {cardIndex + 1} of {cards.length}</span>
              </div>

              <div className={`timer-display ${timeLeft <= 5 ? 'timer-warning' : ''}`}>
                ⏱️ {timeLeft}s
              </div>
            </div>

            {/* Centered Message Card */}
            <div className="card-wrapper">
              <div className={`message-card ${cardExiting ? 'card-exit' : ''}`}>
                <div className="message-content">
                  <p className="message-text">{card.text}</p>
                </div>
              </div>
            </div>

            {/* Answer Buttons */}
            <div className="answer-buttons">
              <button 
                className="answer-btn scam-btn" 
                onClick={() => handleAnswer('scam')}
                disabled={showFeedback}
              >
                ❌ SCAM
              </button>
              <button 
                className="answer-btn safe-btn" 
                onClick={() => handleAnswer('safe')}
                disabled={showFeedback}
              >
                ✅ SAFE
              </button>
            </div>
          </div>
        )}

        {/* Feedback Overlay */}
        {showFeedback && (
          <div className="feedback-overlay">
            <div className={`feedback-modal ${isCorrect ? 'correct-feedback' : 'wrong-feedback'}`}>
              <div className="feedback-icon">
                {isCorrect ? '✅' : lastAnswer === null ? '⏰' : '❌'}
              </div>
              <h3>{isCorrect ? 'Correct!' : lastAnswer === null ? 'Time\'s Up!' : 'Wrong!'}</h3>
              <p className="feedback-explanation">{card?.explanation}</p>
              <div className="feedback-consequence">
                {isCorrect ? 'Moving to next message!' : 'You lost a life!'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions Modal */}
      {gameState === 'instructions' && (
        <div className="game-modal instructions-modal">
          <div className="modal-content">
            <div className="modal-image-container">
              <img src={headerImg} alt="Scam Cat Challenge" className="modal-header-image" />
              <div className="modal-text-overlay">
                <p><strong>Shady Whiskers is trying to trick you!</strong></p>
                <div className="budget-breakdown-overlay">
                  <div>⏱️ 15 seconds per message</div>
                  <div>❌ One wrong answer = lose a life</div>
                  <div>❤️ 3 lives total</div>
                  <div>🎯 Get 5 correct to win!</div>
                </div>
              </div>
            </div>
            <button onClick={startGame} className="start-btn">
              {currentAttempt === 1 ? 'Start Challenge' : `Retry (${currentAttempt}/3)`}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {gameState === 'success' && (
        <div className="game-modal success-modal">
          <div className="modal-content">
            <h2>🎉 You Beat the Scam Cat!</h2>
            <div className="happy-cat">😺✨</div>
            <p>You spotted all the scams like a pro!</p>
            <p>"Shady Whiskers can't trick you anymore!"</p>
            <button onClick={resetGame}>Play Again</button>
            <button onClick={onBack}>Back to Menu</button>
          </div>
        </div>
      )}

      {/* Failed Modal */}
      {gameState === 'failed' && (
        <div className="game-modal failed-modal">
          <div className="modal-content">
            <h2>😿 Scam Cat Got You!</h2>
            <div className="sad-cat">😿💸</div>
            <p>The shady whiskers tricked you!</p>
            <p>Watch out for urgency + threats + too-good-to-be-true offers!</p>
            <button onClick={resetGame}>Try Again</button>
            <button onClick={onBack}>Back to Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScamCat;