import React, { useState, useEffect } from 'react';

// Initial structure for a single game column's scores.
const initialGameScores = {
  aces: null,
  twos: null,
  threes: null,
  fours: null,
  fives: null,
  sixes: null,
  threeOfAKind: null,
  fourOfAKind: null,
  fullHouse: { score: null, checked: false },
  smallStraight: { score: null, checked: false },
  largeStraight: { score: null, checked: false },
  yahtzee: { score: null, checked: false },
  chance: null,
  yahtzeeBonus: { score: null, checked: 0 },
};

// Helper functions
const calculateUpperTotals = (scores) => {
  const upperSubtotal =
    (scores.aces || 0) +
    (scores.twos || 0) +
    (scores.threes || 0) +
    (scores.fours || 0) +
    (scores.fives || 0) +
    (scores.sixes || 0);
  const bonus = upperSubtotal >= 63 ? 35 : 0;
  const upperTotal = upperSubtotal + bonus;
  return { upperSubtotal, bonus, upperTotal };
};

const calculateLowerTotals = (scores) => {
  return (
    (scores.threeOfAKind || 0) +
    (scores.fourOfAKind || 0) +
    (scores.fullHouse.score || 0) +
    (scores.smallStraight.score || 0) +
    (scores.largeStraight.score || 0) +
    (scores.yahtzee.score || 0) +
    (scores.chance || 0) +
    (scores.yahtzeeBonus.score || 0)
  );
};

const App = () => {
  const [fullState, setFullState] = useState(() => {
    try {
      const storedState = localStorage.getItem('yahtzeeScorecard');
      const storedHistory = localStorage.getItem('yahtzeeHistory');
      const storedHistoryIndex = localStorage.getItem('yahtzeeHistoryIndex');

      if (storedState && storedHistory && storedHistoryIndex) {
        return {
          scores: JSON.parse(storedState),
          history: JSON.parse(storedHistory),
          historyIndex: parseInt(storedHistoryIndex, 10),
        };
      }

      const initialScores = {
        game1: initialGameScores,
        game2: initialGameScores,
        game3: initialGameScores,
        game4: initialGameScores,
        game5: initialGameScores,
        game6: initialGameScores,
        darkMode: false,
      };

      return {
        scores: initialScores,
        history: [initialScores],
        historyIndex: 0,
      };
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
      const initialScores = {
        game1: initialGameScores,
        game2: initialGameScores,
        game3: initialGameScores,
        game4: initialGameScores,
        game5: initialGameScores,
        game6: initialGameScores,
        darkMode: false,
      };
      return {
        scores: initialScores,
        history: [initialScores],
        historyIndex: 0,
      };
    }
  });

  const { scores, history, historyIndex } = fullState;

  useEffect(() => {
    try {
      localStorage.setItem('yahtzeeScorecard', JSON.stringify(scores));
      localStorage.setItem('yahtzeeHistory', JSON.stringify(history));
      localStorage.setItem('yahtzeeHistoryIndex', historyIndex.toString());
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }, [scores, history, historyIndex]);

  const updateStateAndHistory = (newScores) => {
    setFullState((prev) => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newScores);
      return {
        scores: newScores,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  };

  const handleNumericChange = (gameId, category, value) => {
    let parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) parsedValue = 0;
    const newScores = JSON.parse(JSON.stringify(scores));
    newScores[gameId][category] = parsedValue;
    updateStateAndHistory(newScores);
  };

  const handleToggleCheckmark = (gameId, category) => {
    let newScore = null;
    let newChecked = false;

    const newScores = JSON.parse(JSON.stringify(scores));
    const gameScores = newScores[gameId];

    switch (category) {
      case 'fullHouse':
        newScore = gameScores.fullHouse.checked ? null : 25;
        newChecked = !gameScores.fullHouse.checked;
        break;
      case 'smallStraight':
        newScore = gameScores.smallStraight.checked ? null : 30;
        newChecked = !gameScores.smallStraight.checked;
        break;
      case 'largeStraight':
        newScore = gameScores.largeStraight.checked ? null : 40;
        newChecked = !gameScores.largeStraight.checked;
        break;
      case 'yahtzee':
        newScore = gameScores.yahtzee.checked ? null : 50;
        newChecked = !gameScores.yahtzee.checked;
        break;
      case 'yahtzeeBonus':
        const currentCount = gameScores.yahtzeeBonus.checked;
        const newCount = currentCount + 1;
        newChecked = newCount;
        newScore = newCount * 100;
        break;
    }

    gameScores[category] = { score: newScore, checked: newChecked };
    updateStateAndHistory(newScores);
  };

  const handleClearColumn = (gameId) => {
    const newScores = JSON.parse(JSON.stringify(scores));
    newScores[gameId] = initialGameScores;
    updateStateAndHistory(newScores);
  };

  const handleClearAll = () => {
    const clearedScores = {
      game1: initialGameScores,
      game2: initialGameScores,
      game3: initialGameScores,
      game4: initialGameScores,
      game5: initialGameScores,
      game6: initialGameScores,
      darkMode: scores.darkMode,
    };
    updateStateAndHistory(clearedScores);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setFullState((prev) => ({
        ...prev,
        scores: prev.history[newIndex],
        historyIndex: newIndex,
      }));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setFullState((prev) => ({
        ...prev,
        scores: prev.history[newIndex],
        historyIndex: newIndex,
      }));
    }
  };

  const handleExportJson = () => {
    const data = JSON.stringify(scores, null, 2);
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = data;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    try {
      document.execCommand('copy');
      alert('Scores copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy scores. Please copy the text manually.');
    }
    document.body.removeChild(tempTextarea);
  };

  const handleImportJson = () => {
    const importData = prompt("Paste your JSON data here:");
    if (importData) {
      try {
        const importedScores = JSON.parse(importData);
        if (
          importedScores.game1 &&
          importedScores.game2 &&
          importedScores.game3 &&
          importedScores.game4 &&
          importedScores.game5 &&
          importedScores.game6
        ) {
          updateStateAndHistory(importedScores);
          alert('Scores imported successfully!');
        } else {
          alert('Invalid JSON data format.');
        }
      } catch (error) {
        alert('Invalid JSON data. Please check the format.');
        console.error("Failed to import scores:", error);
      }
    }
  };

  const handleToggleDarkMode = () => {
    const newScores = { ...scores, darkMode: !scores.darkMode };
    updateStateAndHistory(newScores);
  };

  const isDarkMode = scores.darkMode;

  const tableClasses = isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
  const headerClasses = isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900';
  const stickyHeaderClasses = isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200';
  const inputClasses = isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300';
  const buttonClasses = isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  const checkmarkButtonClasses = "p-1 rounded-full shadow-sm focus:outline-none transition-all duration-200 ease-in-out";
  const checkedClasses = "bg-green-500 text-white hover:bg-green-600";
  const uncheckedClasses = isDarkMode ? "bg-gray-600 text-gray-300 hover:bg-gray-500" : "bg-gray-200 text-gray-500 hover:bg-gray-300";

  const renderScoreRow = (label, renderScoreField, isSubtotal = false, isTotal = false) => {
    const rowClasses = isSubtotal ? 'font-bold' : '';
    const totalRowClasses = isTotal ? 'font-bold text-lg' : '';

    return (
      <tr className={`${rowClasses} ${totalRowClasses} border-t border-gray-200 dark:border-gray-700`}>
        <td className={`sticky left-0 min-w-[150px] px-2 py-2 border-r border-gray-200 dark:border-gray-700 ${stickyHeaderClasses} z-10`}>{label}</td>
        {['game1', 'game2', 'game3', 'game4', 'game5', 'game6'].map((gameId) => (
          <td key={gameId} className="min-w-[100px] px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
            {renderScoreField(gameId)}
          </td>
        ))}
      </tr>
    );
  };

  const renderNumericInput = (gameId, category) => {
    const value = scores[gameId][category];
    return (
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value !== null ? value : ''}
        onChange={(e) => handleNumericChange(gameId, category, e.target.value)}
        className={`w-full text-center rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClasses}`}
      />
    );
  };

  const renderCheckmarkInput = (gameId, category) => {
    const scoreState = scores[gameId][category];
    const score = scoreState.score;
    const isChecked = typeof scoreState.checked === 'number' ? scoreState.checked > 0 : scoreState.checked;
    const isYahtzeeBonus = category === 'yahtzeeBonus';
    const bonusCount = isYahtzeeBonus ? scoreState.checked : 0;

    return (
      <div className="flex items-center justify-center space-x-2">
        <span className="font-mono text-sm">{score !== null ? score : '-'}</span>
        <button
          onClick={() => handleToggleCheckmark(gameId, category)}
          className={`${checkmarkButtonClasses} ${isChecked ? checkedClasses : uncheckedClasses} flex items-center justify-center`}
        >
          {isYahtzeeBonus ? (
            <span className="text-xl leading-none">
              {bonusCount > 0 ? `✅ (${bonusCount})` : '-'}
            </span>
          ) : (
            <span className="text-xl leading-none">
              {isChecked ? '✅' : '-'}
            </span>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-4 font-sans ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="container mx-auto">
        <header className="mb-6 flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-3xl font-bold">Yahtzee Scorecard</h1>
          <div className="flex items-center gap-2">
            <button onClick={handleToggleDarkMode} className={`${buttonClasses} p-2 rounded-full`}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div className="space-x-2">
              <button onClick={handleUndo} disabled={historyIndex <= 0} className={`p-2 rounded-lg shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses}`}>Undo</button>
              <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className={`p-2 rounded-lg shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses}`}>Redo</button>
              <button onClick={handleExportJson} className={`p-2 rounded-lg shadow-sm font-semibold ${buttonClasses}`}>Export</button>
              <button onClick={handleImportJson} className={`p-2 rounded-lg shadow-sm font-semibold ${buttonClasses}`}>Import</button>
              <button onClick={handleClearAll} className={`p-2 rounded-lg shadow-sm font-semibold text-red-600 dark:text-red-400 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>Clear All</button>
            </div>
          </div>
        </header>

        <div className={`overflow-x-auto rounded-lg shadow-xl no-scrollbar`}>
          <table className={`w-full text-sm rounded-lg border-collapse ${tableClasses}`}>
            <thead className={`text-xs uppercase sticky top-0 ${headerClasses}`}>
              <tr>
                <th className={`sticky left-0 min-w-[150px] p-4 text-left border-r border-b border-gray-200 dark:border-gray-700 ${stickyHeaderClasses} z-20`}>Category</th>
                {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => (
                  <th key={num} className="min-w-[100px] p-4 text-center border-r border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="flex-grow text-center">GAME #{num}</span>
                      <button onClick={() => handleClearColumn(`game${num}`)} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-circle"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* UPPER SECTION */}
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td colSpan={7} className={`p-2 text-center text-lg font-bold ${headerClasses}`}>
                  UPPER SECTION
                </td>
              </tr>
              {renderScoreRow('Aces', (id) => renderNumericInput(id, 'aces'))}
              {renderScoreRow('Twos', (id) => renderNumericInput(id, 'twos'))}
              {renderScoreRow('Threes', (id) => renderNumericInput(id, 'threes'))}
              {renderScoreRow('Fours', (id) => renderNumericInput(id, 'fours'))}
              {renderScoreRow('Fives', (id) => renderNumericInput(id, 'fives'))}
              {renderScoreRow('Sixes', (id) => renderNumericInput(id, 'sixes'))}

              {renderScoreRow('UPPER SUBTOTAL', (id) => <span>{calculateUpperTotals(scores[id]).upperSubtotal}</span>, true)}
              {renderScoreRow('BONUS (63+)', (id) => <span>{calculateUpperTotals(scores[id]).bonus}</span>, true)}
              {renderScoreRow('UPPER TOTAL', (id) => <span>{calculateUpperTotals(scores[id]).upperTotal}</span>, true, true)}

              {/* LOWER SECTION */}
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td colSpan={7} className={`p-2 text-center text-lg font-bold ${headerClasses}`}>
                  LOWER SECTION
                </td>
              </tr>
              {renderScoreRow('3 of a Kind', (id) => renderNumericInput(id, 'threeOfAKind'))}
              {renderScoreRow('4 of a Kind', (id) => renderNumericInput(id, 'fourOfAKind'))}
              {renderScoreRow('Full House (25)', (id) => renderCheckmarkInput(id, 'fullHouse'))}
              {renderScoreRow('Small Straight (30)', (id) => renderCheckmarkInput(id, 'smallStraight'))}
              {renderScoreRow('Large Straight (40)', (id) => renderCheckmarkInput(id, 'largeStraight'))}
              {renderScoreRow('Yahtzee (50)', (id) => renderCheckmarkInput(id, 'yahtzee'))}
              {renderScoreRow('Chance', (id) => renderNumericInput(id, 'chance'))}
              {renderScoreRow('Yahtzee Bonus (+100)', (id) => renderCheckmarkInput(id, 'yahtzeeBonus'))}

              {renderScoreRow('LOWER TOTAL', (id) => <span>{calculateLowerTotals(scores[id])}</span>, true, true)}
              {renderScoreRow('GRAND TOTAL', (id) => <span>{calculateUpperTotals(scores[id]).upperTotal + calculateLowerTotals(scores[id])}</span>, false, true)}
            </tbody>
          </table>
        </div>
      </div>
      <div id="modal-container"></div>
    </div>
  );
};

export default App;
