import React, { useState, useEffect, useRef } from 'react';
import './style/ScamCat.css';
import backgroundBudget from '../assets/bg/background_budget.png';

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
  const [gameState, setGameState] = useState('instructions'); // instructions, playing, win, lose
  const [attempts, setAttempts] = useState(3);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [gameCards, setGameCards] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [cardExiting, setCardExiting] = useState(false);
  const timerRef = useRef(null);

  // Shuffle and select 5 random cards for a new game
  const startNewGame = () => {
    const shuffled = [...MESSAGE_POOL].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    setGameCards(selected);
    setCurrentCardIndex(0);
    setTimeLeft(15);
    setGameState('playing');
    setShowFeedback(false);
    setTimerActive(true);
  };

  const handleAnswer = (playerAnswer) => {
    setTimerActive(false);
    
    const currentCard = gameCards[currentCardIndex];
    let correct = false;

    if (playerAnswer === null) {
      // Time ran out
      correct = false;
    } else {
      correct = (playerAnswer === 'scam' && currentCard.isScam) || 
                (playerAnswer === 'safe' && !currentCard.isScam);
    }

    setLastAnswer(playerAnswer);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (!correct) {
      // Game over immediately on wrong answer
      setTimeout(handleIncorrectAnswer, 3000);
    } else {
      // Correct answer
      setTimeout(handleCorrectAnswerPhase1, 2500);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timerActive && timeLeft > 0 && gameState === 'playing' && !showFeedback) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      // Time's up - counts as wrong answer
      handleAnswer(null);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timerActive, timeLeft, gameState, showFeedback]);

  const handleIncorrectAnswer = () => {
    setShowFeedback(false);
    setAttempts(prev => prev - 1);
    
    if (attempts - 1 <= 0) {
      setGameState('lose');
    } else {
      // Reset for next attempt
      setCurrentAttempt(prev => prev + 1);
      setGameState('instructions');
    }
  };

  const handleCorrectAnswerPhase2 = () => {
    setCardExiting(false);
    if (currentCardIndex + 1 < gameCards.length) {
      // Move to next card
      setCurrentCardIndex(prev => prev + 1);
      setTimeLeft(15);
      setTimerActive(true);
    } else {
      // Won the game!
      setGameState('win');
    }
  };

  const handleCorrectAnswerPhase1 = () => {
    setShowFeedback(false);
    setCardExiting(true);
    setTimeout(handleCorrectAnswerPhase2, 500);
  };

  const handleStartGame = () => {
    startNewGame();
  };

  const resetGame = () => {
    setAttempts(3);
    setCurrentAttempt(1);
    setCurrentCardIndex(0);
    setGameCards([]);
    setShowFeedback(false);
    setLastAnswer(null);
    setTimeLeft(15);
    setTimerActive(false);
    setGameState('instructions');
  };

  const currentCard = gameCards[currentCardIndex];
  const progress = ((currentCardIndex) / gameCards.length) * 100;

  return (
    <div className="scam-cat" style={{ backgroundImage: `url(${backgroundBudget})` }}>
      <div className="scam-background-overlay"></div>
      
      {/* Header */}
      <div className="scam-header">
        <button className="scam-back-button" onClick={onBack}>← Back</button>
        <h2>🕵️ Scam Cat (Shady Whisk) 🐱‍💻</h2>
        <div className="scam-stats">
          <div className="hearts">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={i < attempts ? 'heart-full' : 'heart-empty'}>
                {i < attempts ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions Overlay */}
      {gameState === 'instructions' && (
        <div className="scam-modal">
          <div className="scam-modal-content instructions">
            <h2>🐱‍💻 Scam Detection Challenge 🕵️</h2>
            <div className="instructions-text">
              <p><strong>Shady Whisk is trying to trick you!</strong></p>
              <p>You'll see 5 messages. Decide if each is a <span className="scam-highlight">SCAM</span> or <span className="safe-highlight">SAFE</span>.</p>
              
              <div className="warning-box">
                <p>⚠️ <strong>One mistake = Game Over</strong></p>
                <p>You have <strong>{attempts} attempt{attempts === 1 ? '' : 's'}</strong> remaining</p>
                <p>Each message has a <strong>15-second timer</strong></p>
              </div>

              <div className="tips-box">
                <p><strong>🔍 Look for red flags:</strong></p>
                <ul>
                  <li>Urgent threats or deadlines</li>
                  <li>Requests for money or personal info</li>
                  <li>Too-good-to-be-true offers</li>
                  <li>Suspicious links or unknown senders</li>
                </ul>
              </div>
            </div>
            <button onClick={handleStartGame}>
              {currentAttempt === 1 ? 'Start Game' : `Attempt ${currentAttempt} of 3`}
            </button>
          </div>
        </div>
      )}

      {/* Game Area */}
      {gameState === 'playing' && (
        <div className="scam-game-area">
          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            <div className="progress-text">Message {currentCardIndex + 1} of {gameCards.length}</div>
          </div>

          {/* Timer */}
          <div className="timer-container">
            <div className={`timer ${timeLeft <= 5 ? 'timer-warning' : ''}`}>
              ⏱️ {timeLeft}s
            </div>
          </div>

          {/* Card Stack Effect */}
          <div className="card-stack">
            {/* Back cards for stack effect */}
            {currentCardIndex + 1 < gameCards.length && (
              <div className="message-card card-back-2"></div>
            )}
            {currentCardIndex + 2 < gameCards.length && (
              <div className="message-card card-back-1"></div>
            )}
            
            {/* Active Card */}
            {currentCard && (
              <div className={`message-card ${cardExiting ? 'card-exit' : ''}`}>
                <div className="card-header">
                  <span className="sender-icon">📧</span>
                  <span className="sender-name">Unknown Sender</span>
                </div>
                <div className="card-body">
                  <p>{currentCard.text}</p>
                </div>
              </div>
            )}
          </div>

          {/* Answer Buttons */}
          <div className="answer-buttons">
            <button 
              className="answer-button scam-button-answer"
              onClick={() => handleAnswer('scam')}
              disabled={showFeedback}
            >
              <span className="button-icon">❌</span>
              <span>SCAM</span>
            </button>
            <button 
              className="answer-button safe-button-answer"
              onClick={() => handleAnswer('safe')}
              disabled={showFeedback}
            >
              <span className="button-icon">✅</span>
              <span>SAFE</span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback Overlay */}
      {showFeedback && (
        <div className="feedback-overlay">
          <div className={`feedback-content ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="feedback-icon">
              {isCorrect ? '✅' : '❌'}
            </div>
            {(() => {
              let feedbackMessage;
              if (isCorrect) {
                feedbackMessage = 'Correct!';
              } else if (lastAnswer === null) {
                feedbackMessage = 'Time\'s Up!';
              } else {
                feedbackMessage = 'Wrong!';
              }
              return <h3>{feedbackMessage}</h3>;
            })()}
            <p className="feedback-explanation">{currentCard?.explanation}</p>
          </div>
        </div>
      )}

      {/* Win Modal */}
      {gameState === 'win' && (
        <div className="scam-modal">
          <div className="scam-modal-content win">
            <h2>🎉 You Blocked Scam Cat! 🎉</h2>
            <div className="result-icon">😺🛡️</div>
            <p className="result-message">
              You spotted all the scams and stayed safe!
            </p>
            <p className="result-tip">
              "Trust your instincts - if something feels off, it probably is!"
            </p>
            <div className="result-buttons">
              <button className="scam-button" onClick={resetGame}>Play Again</button>
              <button className="scam-button secondary" onClick={onBack}>Back to Menu</button>
            </div>
          </div>
        </div>
      )}

      {/* Lose Modal */}
      {gameState === 'lose' && (
        <div className="scam-modal">
          <div className="scam-modal-content lose">
            <h2>😿 Scam Cat Got You!</h2>
            <div className="result-icon">🐱‍💻💸</div>
            <p className="result-message">
              Don't worry - you've learned from the experience!
            </p>
            <p className="result-tip">
              "Every mistake is a lesson in staying vigilant!"
            </p>
            <div className="result-buttons">
              <button className="scam-button" onClick={resetGame}>Try Again</button>
              <button className="scam-button secondary" onClick={onBack}>Back to Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScamCat;