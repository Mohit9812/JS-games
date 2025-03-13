"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, RotateCcw } from "lucide-react"

function validCell(i: number, j: number, n: number) {
  if (i < 0 || j < 0 || i >= n || j >= n) return false
  return true
}

function toggleColor(currColor: number) {
  return currColor === 0 ? 1 : 0
}

function generateCoordinates(i: number, j: number) {
  return [
    [i, j],
    [i - 1, j],
    [i + 1, j],
    [i, j - 1],
    [i, j + 1],
  ]
}

function checkWin(gameArray: number[][], n: number) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (gameArray[i][j] === 0) return false
    }
  }
  return true
}

// Define a type for our game state to make it easier to track history
type GameState = {
  gameArray: number[][]
  moves: number[][]
}

const DiscolorationGame = () => {
  const [level, setLevel] = useState<number>(2)
  const [gameArray, setGameArray] = useState(Array.from({ length: level }, () => Array(level).fill(0)))
  const [won, setWon] = useState(false)
  const [moves, setMoves] = useState<number[][]>([])
  // Add state for game history to enable undo functionality
  const [gameHistory, setGameHistory] = useState<GameState[]>([])

  useEffect(() => {
    const initialGameArray = Array.from({ length: level }, () => Array(level).fill(0))
    setGameArray(initialGameArray)
    setMoves([])
    setWon(false)
    // Reset history when level changes
    setGameHistory([])
  }, [level])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCellClick = (e: any) => {
    const row = Number(e.target.dataset.row)
    const col = Number(e.target.dataset.col)

    if (won || Number.isNaN(row) || Number.isNaN(col)) return

    // Save current state to history before making changes
    setGameHistory((prev) => [...prev, { gameArray: structuredClone(gameArray), moves: structuredClone(moves) }])

    setMoves((prev) => {
      const tempMoves = structuredClone(prev)
      tempMoves.push([row, col])
      return tempMoves
    })

    const tempGameArray = structuredClone(gameArray)
    const coordinatesArray = generateCoordinates(row, col)

    coordinatesArray.forEach((coord) => {
      if (validCell(coord[0], coord[1], level)) {
        tempGameArray[coord[0]][coord[1]] = toggleColor(gameArray[coord[0]][coord[1]])
      }
    })

    setGameArray(tempGameArray)

    if (checkWin(tempGameArray, level)) {
      setWon(true)
    }
  }

  const resetGame = () => {
    setGameArray(Array.from({ length: level }, () => Array(level).fill(0)))
    setWon(false)
    setMoves([])
    setGameHistory([])
  }

  const handleLevelChange = (newLevel: number) => {
    if (newLevel >= 2 && newLevel <= 8) {
      setLevel(newLevel)
    }
  }

  // Add undo functionality
  const handleUndo = () => {
    if (gameHistory.length > 0) {
      // Get the last state from history
      const lastState = gameHistory[gameHistory.length - 1]

      // Restore the game to the previous state
      setGameArray(lastState.gameArray)
      setMoves(lastState.moves)

      // Remove the used state from history
      setGameHistory((prev) => prev.slice(0, -1))

      // If we were in a won state, we're not anymore after undo
      setWon(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-slate-800">
          Discoloration Game
          {won && <span className="ml-2 text-green-500 animate-pulse">🎉 You Won!</span>}
        </h1>

        <div className="mb-6">
          <div className="text-sm text-slate-500 mb-2 text-center">Level: {level}</div>
          <div
            className="grid gap-1 sm:gap-2 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${level}, 1fr)`,
              maxWidth: `${Math.min(400, level * 60)}px`,
            }}
            onClick={handleCellClick}
          >
            {gameArray.map((row, rowId) =>
              row.map((col, colId) => (
                <div
                  key={`${rowId}-${colId}`}
                  data-row={rowId}
                  data-col={colId}
                  className={`
                    aspect-square rounded-md border-2 border-slate-200 
                    transition-all duration-200 ease-in-out
                    hover:opacity-90 hover:scale-105 active:scale-95
                    ${col === 1 ? "bg-amber-400 shadow-inner" : "bg-slate-100"}
                  `}
                />
              )),
            )}
          </div>
        </div>

        {moves.length > 0 && (
          <div className="mb-6 p-3 bg-slate-50 rounded-lg">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Moves History:</h3>
            <div className="text-xs text-slate-600 max-h-20 overflow-y-auto">
              {moves.map((move, idx) => (
                <span key={idx} className="inline-block mr-2 mb-1 px-2 py-1 bg-white rounded border border-slate-200">
                  [{move[0]},{move[1]}]
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-4">
          {/* Game controls */}
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 flex justify-between gap-2">
              <button
                className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    level > 2
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                onClick={() => handleLevelChange(level - 1)}
                disabled={level <= 2}
              >
                Level Down
              </button>

              <button
                className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    level < 8
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                onClick={() => handleLevelChange(level + 1)}
                disabled={level >= 8}
              >
                Level Up
              </button>
            </div>

            {/* Undo and Reset buttons */}
            <button
              className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors
                ${
                  gameHistory.length > 0
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              onClick={handleUndo}
              disabled={gameHistory.length === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Undo
            </button>

            <button
              className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              onClick={resetGame}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </button>
          </div>

          <div className="flex items-center justify-center mt-4">
            <form
              className="flex items-center space-x-2"
              onSubmit={(e) => {
                e.preventDefault()
                const input = e.currentTarget.elements.namedItem("jumpToInput") as HTMLInputElement
                const newLevel = Number.parseInt(input.value, 10)
                if (newLevel >= 2 && newLevel <= 8) {
                  handleLevelChange(newLevel)
                  input.value = ""
                } else {
                  alert("Please enter a level between 2 and 8.")
                }
              }}
            >
              <label htmlFor="jumpToInput" className="text-sm text-slate-700">
                Jump to:
              </label>
              <input
                id="jumpToInput"
                name="jumpToInput"
                type="number"
                min="2"
                max="8"
                placeholder="2-8"
                className="w-16 px-2 py-1 border border-slate-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-xs text-center text-slate-500">Turn all cells yellow to win the game!</div>
      </div>
    </div>
  )
}

export default DiscolorationGame