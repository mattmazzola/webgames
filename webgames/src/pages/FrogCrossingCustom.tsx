import { useCallback, useEffect, useState } from "react"
import { useTaskAnalytics } from "../utils/useTaskAnalytics"
import { SeededRandom } from "../utils/seededRandom"

export const PASSWORD_FrogCrossingCustom = "HOPPY_CROSSING_CUSTOM"
export const TASK_ID_FrogCrossingCustom = "frog-crossing-custom"

interface Position {
  x: number
  y: number
}

interface Car {
  x: number
  y: number
  direction: "left" | "right"
  speed: number
}

interface TaskData {
  seed: number
  password: string
  gridSize: number
  carRows: number[]
  carsPerRow: number
  moveInterval: number
}

// Default seed for consistent gameplay when no task is provided
const DEFAULT_SEED = 12345

export default function FrogCrossingCustom() {
  const { recordSuccess } = useTaskAnalytics(TASK_ID_FrogCrossingCustom)
  const [gridSize, setGridSize] = useState<number | null>(null)
  const [carRows, setCarRows] = useState<number[] | null>(null)
  const [carsPerRow, setCarsPerRow] = useState<number | null>(null)
  const [moveInterval, setMoveInterval] = useState<number | null>(null)
  const [frog, setFrog] = useState<Position | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [success, setSuccess] = useState(false)
  const [taskData, setTaskData] = useState<TaskData | null>(null)
  const [seed, setSeed] = useState<number>(DEFAULT_SEED)
  const [configError, setConfigError] = useState<string | null>(null)

  // Load task data and set game parameters
  useEffect(() => {
    // Parse URL parameters
    const searchQuery = new URLSearchParams(window.location.search)
    const urlSeed = searchQuery.get("seed")
    const lineIndex = searchQuery.get("lineIndex")
      ? parseInt(searchQuery.get("lineIndex") as string, 10)
      : null

    // If seed is provided directly, use it without loading task data
    if (urlSeed) {
      const parsedSeed = parseInt(urlSeed, 10)
      setSeed(parsedSeed)
      setConfigError("Direct seed mode: Configuration parameters are required in the task data.")
      return
    }

    // If lineIndex is provided, load task data from file
    if (lineIndex !== null) {
      const loadTaskData = async () => {
        try {
          const response = await fetch('/data/frog-crossing/tasks.jsonl')
          if (response.ok) {
            const text = await response.text()

            // Skip comment lines and filter empty lines
            const lines = text.split('\n')
              .filter(line => line.trim() && !line.trim().startsWith('//'))

            if (lineIndex >= 0 && lineIndex < lines.length) {
              const selectedTask = JSON.parse(lines[lineIndex])
              setTaskData(selectedTask)

              // Validate required parameters
              const missingParams = []
              
              // Check for required parameters
              if (!selectedTask.seed) missingParams.push('seed')
              if (!selectedTask.gridSize) missingParams.push('gridSize')
              if (!selectedTask.carRows) missingParams.push('carRows')
              if (!selectedTask.carsPerRow) missingParams.push('carsPerRow')
              if (!selectedTask.moveInterval) missingParams.push('moveInterval')

              if (missingParams.length > 0) {
                const errorMsg = `Missing required parameters in task data: ${missingParams.join(', ')}`
                setConfigError(errorMsg)
                console.error(errorMsg)
                return
              }

              // All required parameters are present, set them
              setSeed(selectedTask.seed);
              setGridSize(selectedTask.gridSize);
              setCarRows(selectedTask.carRows);
              setCarsPerRow(selectedTask.carsPerRow);
              setMoveInterval(selectedTask.moveInterval);
              
              // Update frog position based on grid size
              setFrog({
                x: Math.floor(selectedTask.gridSize / 2),
                y: selectedTask.gridSize - 1,
              });

              console.log("Loaded task with parameters:", selectedTask)
            } else {
              setConfigError(`Invalid lineIndex: ${lineIndex}. Available lines: 0 to ${lines.length - 1}`)
            }
          } else {
            setConfigError("Failed to load tasks.jsonl file")
          }
        } catch (error) {
          console.error("Error loading task data:", error)
          setConfigError(`Error loading task data: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      loadTaskData()
    } else {
      setConfigError("No lineIndex provided in the URL")
    }
  }, [])

  // Initialize cars with seeded random number generator
  useEffect(() => {
    // Only run this effect when all required parameters are available
    if (!gridSize || !carRows || !carsPerRow) return;
    
    const rng = new SeededRandom(seed)
    const initialCars: Car[] = []

    carRows.forEach((row: number, row_index: number) => {
      for (let i = 0; i < carsPerRow; i += 1) {
        initialCars.push({
          x: rng.getRandomInt(0, gridSize - 1),
          y: row,
          // All cars in row move in same direction, alternating by row
          direction: row_index % 2 === 0 ? "left" : "right",
          speed: 1, // Fixed speed for grid movement
        })
      }
    })
    setCars(initialCars)
  }, [seed, carRows, carsPerRow, gridSize]) // Depend on all game parameters

  // Move cars
  useEffect(() => {
    // Only run this effect when all required parameters are available
    if (!gridSize || !moveInterval || gameOver || success) return;

    const moveCarsInterval = setInterval(() => {
      setCars((prevCars) =>
        prevCars.map((car) => {
          let newX = car.direction === "left"
            ? car.x - car.speed
            : car.x + car.speed

          // Wrap around
          if (newX < 0) newX = gridSize - 1
          if (newX >= gridSize) newX = 0

          return { ...car, x: newX }
        })
      )
    }, moveInterval)

    return () => clearInterval(moveCarsInterval)
  }, [gameOver, success, gridSize, moveInterval])

  // Check collisions and win condition
  useEffect(() => {
    // Only run if all required parameters are available
    if (!frog) return;
    
    // Check for collisions with exact grid positions
    const collision = cars.some((car) => car.x === frog.x && car.y === frog.y)

    if (collision) {
      setGameOver(true)
    }

    // Check for win condition (reached top)
    if (frog.y === 0) {
      setSuccess(true)
      recordSuccess() // Record success when the frog reaches the top
    }
  }, [frog, cars, recordSuccess])

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle input when all required parameters are available
      if (!frog || !gridSize || gameOver || success) {
        return;
      }

      setFrog((prev) => {
        // This shouldn't happen because of the guard clause above,
        // but TypeScript needs additional safety
        if (!prev) return prev;
        
        let newX = prev.x;
        let newY = prev.y;

        switch (e.key) {
          case "ArrowUp":
            newY = Math.max(0, prev.y - 1);
            break;
          case "ArrowDown":
            newY = Math.min(gridSize - 1, prev.y + 1);
            break;
          case "ArrowLeft":
            newX = Math.max(0, prev.x - 1);
            break;
          case "ArrowRight":
            newX = Math.min(gridSize - 1, prev.x + 1);
            break;
        }

        return { x: newX, y: newY };
      });
    },
    [gameOver, success, gridSize, frog]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // Get the appropriate password
  const getPassword = () => {
    // If task data is available with a password, use it
    if (taskData?.password) {
      return taskData.password
    }
    // Otherwise use seed-based password or default
    return `HOPPY_CROSSING_${seed}`
  }

  const CELL_PIXEL_SIZE = 50
  // Show configuration error or the game
  if (configError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-900 p-8">
        <h1 className="text-4xl font-bold text-emerald-200 mb-8">Frog Crossing</h1>
        <div className="mb-6 text-2xl font-semibold">
          <div className="text-red-400 p-4 border-2 border-red-600 rounded-lg bg-red-900/30">
            <h2 className="text-xl mb-2">Configuration Error</h2>
            <p>{configError}</p>
            <div className="mt-4 text-sm">
              <p>Please ensure your task data includes all required parameters:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>seed: number</li>
                <li>password: string</li>
                <li>gridSize: number</li>
                <li>carRows: number[]</li>
                <li>carsPerRow: number</li>
                <li>moveInterval: number</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if all required parameters are loaded
  if (!gridSize || !carRows || !carsPerRow || !moveInterval || !frog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-900 p-8">
        <h1 className="text-4xl font-bold text-emerald-200 mb-8">Frog Crossing</h1>
        <div className="text-emerald-300 text-xl">
          Loading game configuration...
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-900 p-8">
      <h1 className="text-4xl font-bold text-emerald-200 mb-8">Frog Crossing</h1>
      <div className="mb-6 text-2xl font-semibold">
        <div className="text-emerald-300">
          Use arrow keys to guide the frog home! 🎮 <br />
          Navigate to the top row without getting hit by cars.
        </div>
        {gameOver
          ? (
            <div className="text-red-400" id="gameover">Game Over! Press Ctrl+R to restart (refresh)</div>
          )
          : success
            ? (
              <div className="text-emerald-400">
                Success! The password is: <span id="password">{getPassword()}</span>
              </div>
            ) : null}
      </div>

      <div
        className="grid gap-0 bg-emerald-800 p-4 rounded-xl shadow-lg border-4 border-emerald-700"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: `${gridSize * CELL_PIXEL_SIZE}px`,
          height: `${gridSize * CELL_PIXEL_SIZE}px`,
        }}
      >
        {/* Grid cells are only rendered when all parameters are available */}
        {gridSize && frog && carRows && Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize
          const y = Math.floor(index / gridSize)
          const isFrog = x === frog.x && y === frog.y
          const car = cars.find((c) => c.x === x && c.y === y)

          return (
            <div
              key={index}
              className={`w-full h-full flex items-center justify-center border-[0.5px] border-emerald-700/30
                ${y === 0
                  ? "bg-emerald-500"
                  : y === gridSize - 1
                    ? "bg-emerald-500"
                    : carRows.includes(y)
                      ? "bg-slate-700"
                      : "bg-emerald-700"
                }
                min-h-[36px] min-w-[36px]
                text-2xl`}
            >
              {isFrog ? (
                <span className="text-3xl transform hover:scale-110 transition-transform absolute">
                  🐸
                </span>
              ) : car ? (
                <span className="text-3xl transform hover:scale-105 transition-transform absolute">
                  {car.direction === "left" ? "🚙" : "🚗"}
                </span>
              ) : (
                <span className="opacity-0 select-none absolute">·</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-emerald-300">
        <p>Current seed: {seed}</p>
        <p className="text-sm mt-2">
          * Using the same seed will generate the same game pattern every time.
        </p>
      </div>
    </div>
  )
}
