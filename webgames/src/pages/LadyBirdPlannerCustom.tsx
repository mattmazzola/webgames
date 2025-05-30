import React, { useState, useEffect } from "react"
import { useTaskAnalytics } from "../utils/useTaskAnalytics"

export const PASSWORD_LadyBirdPlannerCustom = "LADYBIRD_CUSTOM"
export const TASK_ID_LadyBirdPlannerCustom = "ladybird-custom"

interface Position {
  x: number
  y: number
}

interface TaskData {
  start_pos: {
    col: number
    row: number
  }
  end_pos: {
    col: number
    row: number
  },
  password: string
}

interface GridCell {
  isWall: boolean
}

const MOVE_UP = "⬆️"
const MOVE_DOWN = "⬇️"
const MOVE_LEFT = "⬅️"
const MOVE_RIGHT = "➡️"

const LadyBirdPlannerCustom: React.FC = () => {
  const searchQuery = new URLSearchParams(window.location.search)
  const isDebug = searchQuery.get("debug") === "true"
  const lineIndex = searchQuery.get("lineIndex")
    ? parseInt(searchQuery.get("lineIndex") as string, 10)
    : 0

  const { recordSuccess } = useTaskAnalytics(TASK_ID_LadyBirdPlannerCustom)
  const gridSize = 12
  const [inputSequence, setInputSequence] = useState<string>("")
  const [isComplete, setIsComplete] = useState(false)
  const [moveStatus, setMoveStatus] = useState<"none" | "valid" | "invalid">("none")
  const [taskData, setTaskData] = useState<TaskData | null>(null)
  const [ladybirdStart, setLadybirdStart] = useState<Position>({ x: 4, y: 0 })
  const [flowerPosition, setFlowerPosition] = useState<Position>({ x: 8, y: 8 })

  useEffect(() => {
    const loadTaskData = async () => {
      // Try different paths to find the tasks.jsonl file
      const possiblePaths = [
        '/data/ladybird/tasks.jsonl',   // If served from public/data
      ]

      let taskText = null
      for (const path of possiblePaths) {
        try {
          const response = await fetch(path)
          if (response.ok) {
            taskText = await response.text()
            console.log(`Successfully loaded tasks from: ${path}`)
            break
          }
        } catch (fetchError) {
          console.log(`Could not load from ${path}:`, fetchError)
        }
      }

      if (!taskText) {
        throw new Error("No valid task data found in any of the paths.")
      }

      processTasksFile(taskText)
    }

    const processTasksFile = (text: string) => {
      // Skip comment lines and filter empty lines
      const lines = text.split('\n')
        .filter(line => line.trim() && !line.trim().startsWith('//'))

      if (lineIndex >= 0 && lineIndex < lines.length) {
        try {
          const selectedTask = JSON.parse(lines[lineIndex])
          setTaskData(selectedTask)

          // Update ladybird and flower positions based on the task data
          setLadybirdStart({
            x: selectedTask.start_pos.col,
            y: selectedTask.start_pos.row
          })

          setFlowerPosition({
            x: selectedTask.end_pos.col,
            y: selectedTask.end_pos.row
          })

          console.log("Loaded task:", selectedTask)
        } catch (parseError) {
          console.error("Error parsing task JSON:", parseError, "Line:", lines[lineIndex])
        }
      } else {
        console.error("Invalid lineIndex:", lineIndex, "Total lines:", lines.length)
      }
    }

    loadTaskData()
  }, [lineIndex])

  const walls: [number, number][] = [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [6, 0],
    [7, 0],
    [8, 0],
    [9, 0],
    [10, 0],
    [11, 0],
    [11, 1],
    [11, 2],
    [11, 3],
    [11, 4],
    [11, 5],
    [11, 6],
    [11, 7],
    [11, 8],
    [11, 9],
    [11, 10],
    [11, 11],
    [10, 11],
    [8, 11],
    [9, 11],
    [7, 11],
    [6, 11],
    [5, 11],
    [4, 11],
    [3, 11],
    [1, 11],
    [0, 11],
    [2, 11],
    [0, 10],
    [0, 9],
    [0, 8],
    [0, 7],
    [0, 6],
    [0, 5],
    [0, 4],
    [0, 3],
    [0, 2],
    [0, 1],
    [5, 0],
    [5, 1],
    [5, 2],
    [3, 2],
    [2, 2],
    [2, 5],
    [1, 5],
    [4, 7],
    [4, 5],
    [4, 6],
    [3, 7],
    [2, 7],
    [4, 4],
    [2, 3],
    [2, 9],
    [1, 9],
    [3, 9],
    [5, 10],
    [5, 9],
    [7, 8],
    [7, 9],
    [9, 9],
    [8, 9],
    [7, 7],
    [8, 7],
    [9, 7],
    [9, 5],
    [8, 5],
    [5, 6],
    [5, 7],
    [6, 2],
    [6, 3],
    [8, 3],
    [9, 3],
    [6, 4],
    [8, 10],
    [8, 2],
    [9, 2],
    [8, 1],
    [7, 6],
  ]

  // Initial positions are set via useState and useEffect

  // Define the maze layout
  const initialGrid: GridCell[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill({ isWall: false }))

  walls.forEach(([x, y]) => {
    initialGrid[y][x] = { isWall: true }
  })

  const calculatePath = (movesSequence: string): Position[] => {
    const path: Position[] = [{ ...ladybirdStart }]
    let currentPos = { ...ladybirdStart }

    // Split the sequence into chunks of emoji length
    const chunkSize = MOVE_DOWN.length
    const moves: string[] = []
    for (let i = 0; i < movesSequence.length; i += chunkSize) {
      moves.push(movesSequence.slice(i, i + chunkSize))
    }

    for (const move of moves) {
      const newPos = { ...currentPos }

      switch (move) {
        case MOVE_DOWN:
          newPos.y++
          break
        case MOVE_UP:
          newPos.y--
          break
        case MOVE_LEFT:
          newPos.x--
          break
        case MOVE_RIGHT:
          newPos.x++
          break
        default:
          console.log("Unknown move:", move)
      }

      // Check bounds and walls
      if (
        newPos.x < 0 ||
        newPos.x >= gridSize ||
        newPos.y < 0 ||
        newPos.y >= gridSize ||
        walls.some(([wx, wy]) => wx === newPos.x && wy === newPos.y)
      ) {
        return path
      }

      path.push({ ...newPos })
      currentPos = { ...newPos }
    }

    return path
  }

  const handleEmojiClick = (emoji: string) => {
    const newSequence = inputSequence + emoji
    setInputSequence(newSequence)
  }

  const handleSubmit = () => {
    const path = calculatePath(inputSequence)
    const lastPos = path[path.length - 1]
    if (lastPos.x === flowerPosition.x && lastPos.y === flowerPosition.y) {
      setMoveStatus("valid")
      setIsComplete(true)
      recordSuccess()
    } else {
      setMoveStatus("invalid")
    }
  }

  const handleClear = () => {
    setInputSequence("")
    setIsComplete(false)
    setMoveStatus("none")
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">LadyBird Planner (Custom)</h1>
          <p className="text-gray-300 mb-4">
            Plan the ladybird's path to the flower using directional emojis. The
            ladybird won't move until you submit your solution!
          </p>
        </div>

        {/* Grid */}
        <div className="mb-8 inline-block bg-gray-800 p-2 rounded-lg">
          {initialGrid.map((row, y) => (
            <div key={y} className="flex">
              {row.map((_, x) => (
                <div
                  key={`${x}-${y}`}
                  data-testid="grid-cell"
                  className={`w-12 h-12 border border-gray-700 flex items-center justify-center relative ${walls.some(([wx, wy]) => wx === x && wy === y)
                    ? "bg-gray-700"
                    : ""
                    }`}
                >
                  {/* Ladybird and Flower */}
                  <span className="text-xl">
                    {x === ladybirdStart.x && y === ladybirdStart.y && "🐞"}
                    {x === flowerPosition.x && y === flowerPosition.y && "🌸"}
                  </span>
                  {isDebug && (
                    <span
                      className="coordinate-text absolute bottom-0 right-1 text-xs text-gray-400 opacity-70"
                      data-current-position={(x === ladybirdStart.x && y === ladybirdStart.y) ? "true" : "false"}
                    >
                      {x},{y}
                    </span>)}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => handleEmojiClick(MOVE_UP)}
              className="p-2 bg-gray-800 rounded hover:bg-gray-700"
              disabled={isComplete}
            >
              {MOVE_UP}
            </button>
            <button
              onClick={() => handleEmojiClick(MOVE_DOWN)}
              className="p-2 bg-gray-800 rounded hover:bg-gray-700"
              disabled={isComplete}
            >
              {MOVE_DOWN}
            </button>
            <button
              onClick={() => handleEmojiClick(MOVE_LEFT)}
              className="p-2 bg-gray-800 rounded hover:bg-gray-700"
              disabled={isComplete}
            >
              {MOVE_LEFT}
            </button>
            <button
              onClick={() => handleEmojiClick(MOVE_RIGHT)}
              className="p-2 bg-gray-800 rounded hover:bg-gray-700"
              disabled={isComplete}
            >
              {MOVE_RIGHT}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-800 rounded hover:bg-red-700"
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-800 rounded hover:bg-green-700"
              disabled={isComplete || !inputSequence}
            >
              Submit
            </button>
          </div>

          <div
            className={`text-2xl min-h-[3rem] p-4 rounded-lg ${moveStatus === "valid" ? "bg-green-800" : "bg-gray-800"
              }`}
          >
            {inputSequence || "Enter your moves..."}
            {moveStatus === "invalid" && (
              <div className="text-sm mt-2">
                Path does not reach the flower. Try again!
              </div>
            )}
          </div>

          {isComplete && (
            <div className="p-6 bg-green-800 rounded-lg">
              <p className="font-bold text-xl mb-2">Perfect Path Found!</p>
              <p>The password is: <span className="password">{taskData?.password}</span></p>
            </div>
          )}
          {isDebug && taskData && (
            <div>
              <p className="text-green-400 mb-2">
                Task loaded from data/ladybird/tasks.jsonl (line {searchQuery.get("lineIndex") || "0"})
              </p>
              <p className="text-blue-400 mb-2">
                Ladybird at ({ladybirdStart.x}, {ladybirdStart.y}), Flower at ({flowerPosition.x}, {flowerPosition.y})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LadyBirdPlannerCustom
