import { useState, useEffect, useCallback } from 'react'
import Toast from '../Toast'
import Confetti from '../Confetti'

const PATTERNS = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠']
const GRID_SIZE = 9
const TIME_LIMIT = 30

export default function PatternPanicBoard() {
  const [grid, setGrid] = useState([])
  const [targetPattern, setTargetPattern] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [gameState, setGameState] = useState('ready') // 'ready', 'playing', 'ended'
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [highScore, setHighScore] = useState(0)

  // Generate random grid
  const generateGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() => PATTERNS[Math.floor(Math.random() * PATTERNS.length)])
    setGrid(newGrid)
  }, [])

  // Pick a random target pattern
  const pickTarget = useCallback(() => {
    const target = PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
    setTargetPattern(target)
  }, [])

  // Start game
  const startGame = () => {
    setScore(0)
    setTimeLeft(TIME_LIMIT)
    setGameState('playing')
    setMessage('')
    setShowConfetti(false)
    generateGrid()
    pickTarget()
  }

  // Handle cell click
  const handleCellClick = (index) => {
    if (gameState !== 'playing') return

    if (grid[index] === targetPattern) {
      // Correct!
      setScore((s) => s + 1)
      setMessage('✅ Correct!')
      generateGrid()
      pickTarget()
    } else {
      // Wrong!
      setMessage('❌ Wrong pattern!')
      setScore((s) => Math.max(0, s - 1))
    }
  }

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState('ended')
          if (score > highScore) {
            setHighScore(score)
            setShowConfetti(true)
            setMessage(`🎉 New High Score: ${score}!`)
          } else {
            setMessage(`⏰ Time's up! Final Score: ${score}`)
          }
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, score, highScore])

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Title */}
      <div className="text-center mb-6">
        <h2
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--label-primary)' }}
        >
          Pattern Panic
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--label-secondary)' }}
        >
          Click all instances of the target pattern before time runs out!
        </p>
      </div>

      {/* Stats */}
      <div
        className="flex justify-between items-center p-4 rounded-lg mb-6"
        style={{ backgroundColor: 'var(--fill-tertiary)' }}
      >
        <div>
          <p className="text-sm" style={{ color: 'var(--label-secondary)' }}>
            Score
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--label-primary)' }}>
            {score}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--label-secondary)' }}>
            Time Left
          </p>
          <p
            className="text-2xl font-bold"
            style={{
              color: timeLeft <= 5 ? '#ff3b30' : 'var(--label-primary)',
            }}
          >
            {timeLeft}s
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm" style={{ color: 'var(--label-secondary)' }}>
            High Score
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--label-primary)' }}>
            {highScore}
          </p>
        </div>
      </div>

      {/* Target Pattern */}
      {gameState === 'playing' && (
        <div
          className="text-center p-6 rounded-lg mb-6"
          style={{ backgroundColor: 'var(--fill-secondary)' }}
        >
          <p className="text-sm mb-2" style={{ color: 'var(--label-secondary)' }}>
            Find this pattern:
          </p>
          <div className="text-6xl">{targetPattern}</div>
        </div>
      )}

      {/* Game Grid */}
      {gameState === 'playing' && (
        <div
          className="grid grid-cols-3 gap-3 mb-6"
          style={{ aspectRatio: '1/1' }}
        >
          {grid.map((pattern, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className="rounded-lg flex items-center justify-center text-5xl transition-transform active:scale-95 hover:scale-105"
              style={{
                backgroundColor: 'var(--fill-tertiary)',
                aspectRatio: '1/1',
              }}
            >
              {pattern}
            </button>
          ))}
        </div>
      )}

      {/* Start/Restart Button */}
      {(gameState === 'ready' || gameState === 'ended') && (
        <button
          onClick={startGame}
          className="w-full px-6 py-4 rounded-lg font-semibold text-white text-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {gameState === 'ready' ? 'Start Game' : 'Play Again'}
        </button>
      )}

      {/* Instructions */}
      {gameState === 'ready' && (
        <div
          className="mt-6 p-4 rounded-lg"
          style={{ backgroundColor: 'var(--fill-tertiary)' }}
        >
          <h3
            className="font-semibold mb-2"
            style={{ color: 'var(--label-primary)' }}
          >
            How to Play:
          </h3>
          <ul
            className="text-sm space-y-1"
            style={{ color: 'var(--label-secondary)' }}
          >
            <li>• Click on the pattern shown at the top</li>
            <li>• Each correct click earns 1 point</li>
            <li>• Wrong clicks lose 1 point</li>
            <li>• You have {TIME_LIMIT} seconds to score as high as possible!</li>
          </ul>
        </div>
      )}

      {/* Toast Message */}
      {message && <Toast message={message} />}

      {/* Confetti */}
      {showConfetti && <Confetti />}
    </div>
  )
}
