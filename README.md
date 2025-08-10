# Yahtzee Scorecard

A web-based Yahtzee scorecard built with React and Vite. Easily track scores for up to 6 games, with features like dark mode, undo/redo, import/export, and persistent local storage.

## Features
- Track scores for 6 simultaneous Yahtzee games
- Undo and redo score changes
- Import/export scores as JSON
- Clear individual columns or all scores
- Dark mode toggle
- Persistent state using local storage

## Usage
1. Enter scores for each category and game column.
2. Use checkmarks for Full House, Straights, Yahtzee, and Yahtzee Bonus.
3. Undo/redo changes using the respective buttons.
4. Export scores to JSON (copied to clipboard) or import from JSON.
5. Toggle dark mode for a comfortable viewing experience.

## Setup
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd Yahtzee-Scorecard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Technologies Used
- React
- Vite
- Tailwind CSS

## License
MIT
