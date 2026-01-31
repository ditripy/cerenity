import React, { useState, useEffect, useRef } from 'react';
import './SpendingSorter.css';
import backgroundBudget from '../assets/bg/background_budget.png';

const ITEM_TYPES = {
  FOOD: { name: 'food', category: 'needs', emoji: '🐟', points: 10, cost: 40 },
  RENT: { name: 'rent', category: 'needs', emoji: '🏠', points: 15, cost: 400 },
  MEDICINE: { name: 'medicine', category: 'needs', emoji: '💊', points: 12, cost: 60 },
  GAMES: { name: 'games', category: 'wants', emoji: '🎮', points: 8, cost: 50 },
  TOYS: { name: 'toys', category: 'wants', emoji: '🧸', points: 6, cost: 30 },
  TREATS: { name: 'treats', category: 'wants', emoji: '🍪', points: 5, cost: 15 },
  SAVINGS: { name: 'savings', category: 'savings', emoji: '🏛️', points: 20, cost: 100 },
  EMERGENCY: { name: 'emergency', category: 'savings', emoji: '🆘', points: 25, cost: 200 }
};

function SpendingSorter({ onBack }) {
  const [fallingItems, setFallingItems] = useState([]);
  const [buckets, setBuckets] = useState({
    needs: { items: [], totalPoints: 0, money: 0 },
    wants: { items: [], totalPoints: 0, money: 0 },
    savings: { items: [], totalPoints: 0, money: 0 }
  });
  const [money, setMoney] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, success, failed
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(60); // 60 seconds
  const gameAreaRef = useRef(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // helper to spawn a single item
  const spawnItem = () => {
    const itemTypes = Object.values(ITEM_TYPES);
    const randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    const areaWidth = (gameAreaRef.current && gameAreaRef.current.clientWidth) ? gameAreaRef.current.clientWidth : 400;
    const padding = 20; // keep items away from the absolute edges
    const spawnX = Math.random() * Math.max(0, areaWidth - padding * 2) + padding;
    const newItem = {
      id: Date.now() + Math.random(),
      ...randomItem,
      x: spawnX, // Random x position within game area
      y: -50, // Start above screen
      speed: 1 + Math.random() * 2 // Random fall speed (slightly slower)
    };

    setFallingItems(prev => [...prev, newItem]);
  };

  // Spawn falling items periodically (faster)
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (gameState === 'playing' && gameTime > 0) {
        spawnItem();
      }
    }, 800); // spawn ~every 0.8s

    return () => clearInterval(spawnInterval);
  }, [gameState, gameTime]);

  // initialize random starting money once
  useEffect(() => {
    // random amount between 100 and 1000 divisible by 10
    const tens = Math.floor(Math.random() * 91) + 10; // 10..100
    const startMoney = tens * 10;
    setMoney(startMoney);
  }, []);

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
        setFallingItems(prev => {
          const maxY = (gameAreaRef.current && gameAreaRef.current.clientHeight) ? gameAreaRef.current.clientHeight + 50 : 600;
          return prev.map(item => ({ ...item, y: item.y + item.speed }))
            .filter(item => item.y < maxY); // Remove items that fall off screen
        });
      }
    }, 30); // slightly faster updates for smoother motion

    return () => clearInterval(moveItems);
  }, [gameState]);

  const handleItemDrop = (item, bucketType) => {
    // Remove item from falling items
    setFallingItems(prev => prev.filter(i => i.id !== item.id));

    if (bucketType === 'ignore') {
      // ignoring item: don't deduct money or change score
      return;
    }

    // Deduct cost from player money (but never below 0)
    const cost = item.cost || 0;
    setMoney(prev => Math.max(0, prev - cost));

    if (item.category === bucketType) {
      // Correct bucket: add to bucket items, add points and money allocated
      setBuckets(prev => ({
        ...prev,
        [bucketType]: {
          items: [...prev[bucketType].items, item],
          totalPoints: prev[bucketType].totalPoints + item.points,
          money: prev[bucketType].money + cost
        }
      }));
      setScore(prev => prev + item.points);
    } else {
      // Wrong bucket - still count money spent but penalize points
      setBuckets(prev => ({
        ...prev,
        [bucketType]: {
          items: [...prev[bucketType].items, item],
          totalPoints: prev[bucketType].totalPoints,
          money: prev[bucketType].money + cost
        }
      }));
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  const endGame = () => {
    const totalMoney = buckets.needs.money + buckets.wants.money + buckets.savings.money;
    if (totalMoney === 0) {
      setGameState('failed');
      return;
    }

    const needsPercent = (buckets.needs.money / totalMoney) * 100;
    const wantsPercent = (buckets.wants.money / totalMoney) * 100;
    const savingsPercent = (buckets.savings.money / totalMoney) * 100;

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
      needs: { items: [], totalPoints: 0, money: 0 },
      wants: { items: [], totalPoints: 0, money: 0 },
      savings: { items: [], totalPoints: 0, money: 0 }
    });
    setGameState('playing');
    setScore(0);
    setGameTime(60);
    // spawn a few initial items immediately so the player sees activity
    setTimeout(() => { spawnItem(); spawnItem(); spawnItem(); }, 100);
  };

  const calculatePercentages = () => {
    const total = buckets.needs.money + buckets.wants.money + buckets.savings.money;
    if (total === 0) return { needs: 0, wants: 0, savings: 0 };

    return {
      needs: Math.round((buckets.needs.money / total) * 100),
      wants: Math.round((buckets.wants.money / total) * 100),
      savings: Math.round((buckets.savings.money / total) * 100)
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
          <div>Money: ${money}</div>
        </div>
      </div>

      <div className="game-instructions">
        Drag items to correct buckets! Target: 50% Needs, 30% Wants, 20% Savings
      </div>

      <div className="budget-targets">
        <div>Starting: ${money}</div>
        <div>Needs (50%): ${Math.round(money * 0.5)}</div>
        <div>Wants (30%): ${Math.round(money * 0.3)}</div>
        <div>Savings (20%): ${money - Math.round(money * 0.5) - Math.round(money * 0.3)}</div>
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
              <span className="item-cost">{'$' + (item.cost || 0)}</span>
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
            <div className="bucket-total">Allocated: ${buckets.needs.money}</div>
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
            <div className="bucket-total">Allocated: ${buckets.wants.money}</div>
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
            <div className="bucket-total">Allocated: ${buckets.savings.money}</div>
            <div className="bucket-items">
              {buckets.savings.items.map((item, index) => (
                <span key={index} className="bucket-item">{item.emoji}</span>
              ))}
            </div>
          </div>

          {/* Ignore bucket */}
          <div 
            className="bucket ignore-bucket"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedItem) {
                handleItemDrop(draggedItem, 'ignore');
                setDraggedItem(null);
              }
            }}
          >
            <h3>Ignore 🚫</h3>
            <div className="bucket-total">Don't spend on these</div>
            <div className="bucket-items">
              {/* showing items ignored */}
              {[]}
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