import React, { useState, useEffect, useRef } from 'react';
import './SpendingSorter.css';
import backgroundBudget from '../assets/bg/background_budget.png';

const ITEM_TYPES = {
  FOOD: { name: 'food', category: 'needs', emoji: '🐟', points: 10 },
  RENT: { name: 'rent', category: 'needs', emoji: '🏠', points: 15 },
  MEDICINE: { name: 'medicine', category: 'needs', emoji: '💊', points: 12 },
  GAMES: { name: 'games', category: 'wants', emoji: '🎮', points: 8 },
  TOYS: { name: 'toys', category: 'wants', emoji: '🧸', points: 6 },
  TREATS: { name: 'treats', category: 'wants', emoji: '🍪', points: 5 },
  SAVINGS: { name: 'savings', category: 'savings', emoji: '🏛️', points: 20 },
  EMERGENCY: { name: 'emergency', category: 'savings', emoji: '🆘', points: 25 }
};

function SpendingSorter({ onBack }) {
  const [fallingItems, setFallingItems] = useState([]);
  const [buckets, setBuckets] = useState({
    needs: { items: [], total: 0 },
    wants: { items: [], total: 0 },
    savings: { items: [], total: 0 }
  });
  const [gameState, setGameState] = useState('playing'); // playing, success, failed
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(60); // 60 seconds
  const gameAreaRef = useRef(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // Spawn falling items
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (gameState === 'playing' && gameTime > 0) {
        const itemTypes = Object.values(ITEM_TYPES);
        const randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const newItem = {
          id: Date.now() + Math.random(),
          ...randomItem,
          x: Math.random() * 400, // Random x position
          y: -50, // Start above screen
          speed: 1 + Math.random() * 2 // Random fall speed
        };
        
        setFallingItems(prev => [...prev, newItem]);
      }
    }, 2000); // Spawn every 2 seconds

    return () => clearInterval(spawnInterval);
  }, [gameState, gameTime]);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing' && gameTime > 0) {
      const timer = setTimeout(() => {
        setGameTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameTime === 0) {
      endGame();
    }
  }, [gameTime, gameState]);

  // Move falling items
  useEffect(() => {
    const moveItems = setInterval(() => {
      if (gameState === 'playing') {
        setFallingItems(prev => 
          prev.map(item => ({
            ...item,
            y: item.y + item.speed
          })).filter(item => item.y < 600) // Remove items that fall off screen
        );
      }
    }, 50);

    return () => clearInterval(moveItems);
  }, [gameState]);

  const handleItemDrop = (item, bucketType) => {
    if (item.category === bucketType) {
      // Correct bucket
      setBuckets(prev => ({
        ...prev,
        [bucketType]: {
          items: [...prev[bucketType].items, item],
          total: prev[bucketType].total + item.points
        }
      }));
      setScore(prev => prev + item.points);
    } else {
      // Wrong bucket - lose points
      setScore(prev => Math.max(0, prev - 5));
    }

    // Remove item from falling items
    setFallingItems(prev => prev.filter(i => i.id !== item.id));
  };

  const endGame = () => {
    const totalPoints = buckets.needs.total + buckets.wants.total + buckets.savings.total;
    if (totalPoints === 0) {
      setGameState('failed');
      return;
    }

    const needsPercent = (buckets.needs.total / totalPoints) * 100;
    const wantsPercent = (buckets.wants.total / totalPoints) * 100;
    const savingsPercent = (buckets.savings.total / totalPoints) * 100;

    // Check if percentages are close to targets (50% needs, 30% wants, 20% savings)
    const needsTarget = Math.abs(needsPercent - 50) <= 15;
    const wantsTarget = Math.abs(wantsPercent - 30) <= 15;
    const savingsTarget = Math.abs(savingsPercent - 20) <= 15;

    if (needsTarget && wantsTarget && savingsTarget) {
      setGameState('success');
    } else {
      setGameState('failed');
    }
  };

  const resetGame = () => {
    setFallingItems([]);
    setBuckets({
      needs: { items: [], total: 0 },
      wants: { items: [], total: 0 },
      savings: { items: [], total: 0 }
    });
    setGameState('playing');
    setScore(0);
    setGameTime(60);
  };

  const calculatePercentages = () => {
    const total = buckets.needs.total + buckets.wants.total + buckets.savings.total;
    if (total === 0) return { needs: 0, wants: 0, savings: 0 };
    
    return {
      needs: Math.round((buckets.needs.total / total) * 100),
      wants: Math.round((buckets.wants.total / total) * 100),
      savings: Math.round((buckets.savings.total / total) * 100)
    };
  };

  const percentages = calculatePercentages();

  return (
    <div className="spending-sorter" style={{ backgroundImage: `url(${backgroundBudget})` }}>
      <div className="background-overlay"></div>
      <div className="game-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <h2>Spending Sorter 🐱💰</h2>
        <div className="game-stats">
          <div>Time: {gameTime}s</div>
          <div>Score: {score}</div>
        </div>
      </div>

      <div className="game-instructions">
        Drag items to correct buckets! Target: 50% Needs, 30% Wants, 20% Savings
      </div>

      <div className="game-area" ref={gameAreaRef}>
        {/* Falling Items */}
        {fallingItems.map(item => (
          <div
            key={item.id}
            className="falling-item"
            style={{ 
              left: `${item.x}px`, 
              top: `${item.y}px`,
              position: 'absolute'
            }}
            draggable
            onDragStart={(e) => {
              setDraggedItem(item);
              e.dataTransfer.effectAllowed = 'move';
            }}
          >
            <span className="item-emoji">{item.emoji}</span>
            <span className="item-name">{item.name}</span>
          </div>
        ))}

        {/* Budget Buckets */}
        <div className="buckets-container">
          <div 
            className="bucket needs-bucket"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedItem) {
                handleItemDrop(draggedItem, 'needs');
                setDraggedItem(null);
              }
            }}
          >
            <h3>Needs 🏠</h3>
            <div className="bucket-percentage">{percentages.needs}% (Target: 50%)</div>
            <div className="bucket-total">Points: {buckets.needs.total}</div>
            <div className="bucket-items">
              {buckets.needs.items.map((item, index) => (
                <span key={index} className="bucket-item">{item.emoji}</span>
              ))}
            </div>
          </div>

          <div 
            className="bucket wants-bucket"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedItem) {
                handleItemDrop(draggedItem, 'wants');
                setDraggedItem(null);
              }
            }}
          >
            <h3>Wants 🎮</h3>
            <div className="bucket-percentage">{percentages.wants}% (Target: 30%)</div>
            <div className="bucket-total">Points: {buckets.wants.total}</div>
            <div className="bucket-items">
              {buckets.wants.items.map((item, index) => (
                <span key={index} className="bucket-item">{item.emoji}</span>
              ))}
            </div>
          </div>

          <div 
            className="bucket savings-bucket"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedItem) {
                handleItemDrop(draggedItem, 'savings');
                setDraggedItem(null);
              }
            }}
          >
            <h3>Savings 💰</h3>
            <div className="bucket-percentage">{percentages.savings}% (Target: 20%)</div>
            <div className="bucket-total">Points: {buckets.savings.total}</div>
            <div className="bucket-items">
              {buckets.savings.items.map((item, index) => (
                <span key={index} className="bucket-item">{item.emoji}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Game End Modals */}
      {gameState === 'success' && (
        <div className="game-modal success-modal">
          <div className="modal-content">
            <h2>🎉 Purr-fect Budget! 🐱</h2>
            <div className="happy-cat">😺✨</div>
            <p>You balanced your budget like a pro!</p>
            <p>"Track where your tuna goes! Needs first, then wants!"</p>
            <button onClick={resetGame}>Play Again</button>
            <button onClick={onBack}>Back to Menu</button>
          </div>
        </div>
      )}

      {gameState === 'failed' && (
        <div className="game-modal failed-modal">
          <div className="modal-content">
            <h2>😿 Oops! Try Again</h2>
            <div className="sad-cat">😿💸</div>
            <p>Your budget needs some work!</p>
            <p>Remember: 50% needs, 30% wants, 20% savings</p>
            <button onClick={resetGame}>Try Again</button>
            <button onClick={onBack}>Back to Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpendingSorter;