import React, { useState, useEffect, useRef } from 'react';
import './style/SpendingSorter.css';
import backgroundBudget from '../assets/bg/background_budget.png';

const ITEM_TYPES = {
  // Needs - varying prices
  FOOD_LOW: { name: 'food', category: 'needs', emoji: '🐟', points: 10, cost: 30 },
  FOOD_MED: { name: 'food', category: 'needs', emoji: '🐟', points: 10, cost: 50 },
  FOOD_HIGH: { name: 'food', category: 'needs', emoji: '🐟', points: 10, cost: 70 },
  RENT_LOW: { name: 'rent', category: 'needs', emoji: '🏠', points: 15, cost: 300 },
  RENT_MED: { name: 'rent', category: 'needs', emoji: '🏠', points: 15, cost: 500 },
  RENT_HIGH: { name: 'rent', category: 'needs', emoji: '🏠', points: 15, cost: 700 },
  MEDICINE_LOW: { name: 'medicine', category: 'needs', emoji: '💊', points: 12, cost: 40 },
  MEDICINE_HIGH: { name: 'medicine', category: 'needs', emoji: '💊', points: 12, cost: 80 },
  UTILITIES: { name: 'utilities', category: 'needs', emoji: '💡', points: 12, cost: 60 },
  TRANSPORT: { name: 'transport', category: 'needs', emoji: '🚗', points: 10, cost: 100 },
  INSURANCE: { name: 'insurance', category: 'needs', emoji: '🛡️', points: 13, cost: 90 },
  
  // Wants - varying prices
  GAMES_LOW: { name: 'games', category: 'wants', emoji: '🎮', points: 8, cost: 30 },
  GAMES_HIGH: { name: 'games', category: 'wants', emoji: '🎮', points: 8, cost: 60 },
  TOYS_LOW: { name: 'toys', category: 'wants', emoji: '🧸', points: 6, cost: 20 },
  TOYS_HIGH: { name: 'toys', category: 'wants', emoji: '🧸', points: 6, cost: 40 },
  TREATS_LOW: { name: 'treats', category: 'wants', emoji: '🍪', points: 5, cost: 10 },
  TREATS_HIGH: { name: 'treats', category: 'wants', emoji: '🍪', points: 5, cost: 25 },
  MOVIES: { name: 'movies', category: 'wants', emoji: '🎬', points: 6, cost: 35 },
  DINING: { name: 'dining', category: 'wants', emoji: '🍕', points: 7, cost: 45 },
  CLOTHES_LOW: { name: 'clothes', category: 'wants', emoji: '👕', points: 7, cost: 50 },
  CLOTHES_HIGH: { name: 'clothes', category: 'wants', emoji: '👕', points: 7, cost: 100 },
  VACATION: { name: 'vacation', category: 'wants', emoji: '✈️', points: 9, cost: 150 },
  
  // Savings - varying amounts
  SAVINGS_LOW: { name: 'savings', category: 'savings', emoji: '🏛️', points: 20, cost: 50 },
  SAVINGS_MED: { name: 'savings', category: 'savings', emoji: '🏛️', points: 20, cost: 100 },
  SAVINGS_HIGH: { name: 'savings', category: 'savings', emoji: '🏛️', points: 20, cost: 150 },
  EMERGENCY_LOW: { name: 'emergency', category: 'savings', emoji: '🆘', points: 25, cost: 100 },
  EMERGENCY_HIGH: { name: 'emergency', category: 'savings', emoji: '🆘', points: 25, cost: 200 },
  INVESTMENT: { name: 'investment', category: 'savings', emoji: '📈', points: 22, cost: 120 }
};

function SpendingSorter({ onBack }) {
  const [scatteredItems, setScatteredItems] = useState([]);
  const [buckets, setBuckets] = useState({
    needs: { items: [], totalPoints: 0, money: 0 },
    wants: { items: [], totalPoints: 0, money: 0 },
    savings: { items: [], totalPoints: 0, money: 0 }
  });
  const [money, setMoney] = useState(0);
  const [gameState, setGameState] = useState('instructions'); // instructions, playing, success, failed
  const [score, setScore] = useState(0);
  const gameAreaRef = useRef(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // Generate scattered items when game starts
  const generateScatteredItems = () => {
    const itemTypes = Object.values(ITEM_TYPES);
    const numItems = 10 + Math.floor(Math.random() * 6); // 10-15 items
    const items = [];
    
    const areaWidth = (gameAreaRef.current && gameAreaRef.current.clientWidth) ? gameAreaRef.current.clientWidth : 800;
    const areaHeight = (gameAreaRef.current && gameAreaRef.current.clientHeight) ? gameAreaRef.current.clientHeight : 400;
    const paddingX = 20;
    const paddingTop = 20;
    const bucketHeight = 200; // reserve space for buckets at bottom (min-height + padding)
    const maxY = areaHeight - bucketHeight; // only spawn above buckets
    const itemWidth = 120; // approximate item width with padding
    const itemHeight = 50; // approximate item height
    
    // Check if two items overlap
    const checkOverlap = (x, y, existingItems) => {
      for (const existing of existingItems) {
        const dx = Math.abs(x - existing.x);
        const dy = Math.abs(y - existing.y);
        if (dx < itemWidth && dy < itemHeight) {
          return true; // overlapping
        }
      }
      return false; // no overlap
    };
    
    for (let i = 0; i < numItems; i++) {
      const randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      let x, y;
      let attempts = 0;
      const maxAttempts = 50;
      
      // Try to find a non-overlapping position
      do {
        x = Math.random() * Math.max(0, areaWidth - paddingX * 2 - itemWidth) + paddingX;
        y = paddingTop + Math.random() * Math.max(0, maxY - paddingTop * 2 - itemHeight);
        attempts++;
      } while (checkOverlap(x, y, items) && attempts < maxAttempts);
      
      // Only add if we found a valid position (or gave up after max attempts)
      if (attempts < maxAttempts || items.length === 0) {
        items.push({
          id: Date.now() + Math.random() + i,
          ...randomItem,
          x,
          y
        });
      }
    }
    
    setScatteredItems(items);
  };

  // initialize random starting money once
  useEffect(() => {
    // random amount between 100 and 1000 divisible by 10
    const tens = Math.floor(Math.random() * 91) + 10; // 10..100
    const startMoney = tens * 10;
    setMoney(startMoney);
  }, []);



  const handleItemDrop = (item, bucketType) => {
    // Remove item from scattered items
    setScatteredItems(prev => prev.filter(i => i.id !== item.id));

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

  const handleFinish = () => {
    if (scatteredItems.length > 0) {
      alert('Please sort all items or ignore them before finishing!');
      return;
    }
    endGame();
  };

  const resetGame = () => {
    setScatteredItems([]);
    setBuckets({
      needs: { items: [], totalPoints: 0, money: 0 },
      wants: { items: [], totalPoints: 0, money: 0 },
      savings: { items: [], totalPoints: 0, money: 0 }
    });
    setGameState('instructions');
    setScore(0);
    // Generate new random money amount
    const tens = Math.floor(Math.random() * 91) + 10;
    const startMoney = tens * 10;
    setMoney(startMoney);
  };

  const startGame = () => {
    setGameState('playing');
    setTimeout(() => generateScatteredItems(), 100);
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
          <div>Score: {score}</div>
          <div>Money: ${money}</div>
          {gameState === 'playing' && (
            <button className="finish-button" onClick={handleFinish}>Finish</button>
          )}
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
        {/* Scattered Items */}
        {scatteredItems.map(item => (
          <div
            key={item.id}
            className="scattered-item"
            style={{ 
              left: `${item.x}px`, 
              top: `${item.y}px`,
              position: 'absolute',
              opacity: draggedItem && draggedItem.id === item.id ? 0.5 : 1
            }}
            draggable
            onDragStart={(e) => {
              setDraggedItem(item);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', item.id);
            }}
            onDragEnd={(e) => {
              // Reset opacity when drag ends
              e.preventDefault();
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
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedItem) {
                handleItemDrop(draggedItem, 'needs');
                setDraggedItem(null);
              }
            }}
          >
            <h3>Needs 🏠</h3>
            <div className="bucket-total">Allocated: ${buckets.needs.money}</div>
            <div className="bucket-items">
              {buckets.needs.items.map((item, index) => (
                <span key={index} className="bucket-item">{item.emoji}</span>
              ))}
            </div>
          </div>

          <div 
            className="bucket wants-bucket"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedItem) {
                handleItemDrop(draggedItem, 'wants');
                setDraggedItem(null);
              }
            }}
          >
            <h3>Wants 🎮</h3>
            <div className="bucket-total">Allocated: ${buckets.wants.money}</div>
            <div className="bucket-items">
              {buckets.wants.items.map((item, index) => (
                <span key={index} className="bucket-item">{item.emoji}</span>
              ))}
            </div>
          </div>

          <div 
            className="bucket savings-bucket"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedItem) {
                handleItemDrop(draggedItem, 'savings');
                setDraggedItem(null);
              }
            }}
          >
            <h3>Savings 💰</h3>
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
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
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

      {/* Instructions Modal */}
      {gameState === 'instructions' && (
        <div className="game-modal instructions-modal">
          <div className="modal-content">
            <h2>💰 Budget Challenge 🐱</h2>
            <div className="instructions-text">
              <p><strong>You have: ${money}</strong></p>
              <p>Budget your money using the 50-30-20 rule:</p>
              <div className="budget-breakdown">
                <div>🏠 <strong>Needs (50%):</strong> ${Math.round(money * 0.5)}</div>
                <div>🎮 <strong>Wants (30%):</strong> ${Math.round(money * 0.3)}</div>
                <div>💰 <strong>Savings (20%):</strong> ${money - Math.round(money * 0.5) - Math.round(money * 0.3)}</div>
              </div>
              <p style={{ marginTop: '1rem' }}>Drag expenses to the right category!</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Tip: Use the Ignore bucket if an expense doesn't fit your budget.</p>
            </div>
            <button onClick={startGame}>Start Game</button>
          </div>
        </div>
      )}

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