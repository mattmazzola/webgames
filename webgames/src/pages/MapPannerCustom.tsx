import React, { useRef, useState, useEffect } from "react";
import { useTaskAnalytics } from "../utils/useTaskAnalytics";

export const PASSWORD_MapPannerCustom = "CARTOGRAPHER2024_CUSTOM";
export const TASK_ID_MapPannerCustom = "map-panner-custom";

interface TaskData {
  target_x: number;
  target_y: number;
  password: string;
}

interface Position {
  x: number;
  y: number;
}

const MapPannerCustom: React.FC = () => {
  const searchQuery = new URLSearchParams(window.location.search);
  const isDebug = searchQuery.get("debug") === "true";
  const lineIndex = searchQuery.get("lineIndex")
    ? parseInt(searchQuery.get("lineIndex") as string, 10)
    : 0;

  const { recordSuccess } = useTaskAnalytics(TASK_ID_MapPannerCustom);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [startDrag, setStartDrag] = useState<Position>({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [taskData, setTaskData] = useState<TaskData | null>(null);

  // Default treasure location (will be overridden by task data)
  const [treasureLocation, setTreasureLocation] = useState<Position>({ x: 1500, y: 1200 });
  const treasureRadius = 150; // Distance within which the treasure can be found

  useEffect(() => {
    const loadTaskData = async () => {
      // Try different paths to find the tasks.jsonl file
      const possiblePaths = [
        '/data/map-panner/tasks.jsonl',   // If served from public/data
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

          // Update treasure location based on the task data
          setTreasureLocation({
            x: selectedTask.target_x,
            y: selectedTask.target_y
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

  // Calculate the viewport center position on the map
  const getViewportCenter = () => ({
    x: -position.x + window.innerWidth / 2,
    y: -position.y + window.innerHeight / 2,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartDrag({ x: e.clientX, y: e.clientY });
    setStartPos({ ...position });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - startDrag.x;
    const dy = e.clientY - startDrag.y;

    setPosition({
      x: startPos.x + dx,
      y: startPos.y + dy,
    });

    // Check if we're near the treasure
    const viewportCenter = getViewportCenter();
    const distance = Math.sqrt(
      Math.pow(viewportCenter.x - treasureLocation.x, 2) +
        Math.pow(viewportCenter.y - treasureLocation.y, 2)
    );

    if (distance < treasureRadius && !isComplete) {
      setIsComplete(true);
      recordSuccess();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate a grid of coordinates as map markers
  const generateMapMarkers = () => {
    const markers = [];
    for (let x = 0; x < 2000; x += 200) {
      for (let y = 0; y < 2000; y += 200) {
        markers.push(
          <div
            key={`${x}-${y}`}
            className="absolute text-gray-400 text-sm"
            style={{ left: x, top: y }}
          >
            {`${x},${y}`}
          </div>
        );
      }
    }
    return markers;
  };

  // Get the current viewport center for the scanning circle
  const viewportCenter = getViewportCenter();

  // Generate hint message based on treasure location
  const getHintMessage = () => {
    if (!taskData) return "Pan around the map to find the hidden treasure...";
    
    // Calculate a range around the target location
    const minX = Math.max(0, treasureLocation.x - 200);
    const maxX = Math.min(2000, treasureLocation.x + 200);
    const minY = Math.max(0, treasureLocation.y - 200);
    const maxY = Math.min(2000, treasureLocation.y + 200);
    
    // Determine which quadrant the treasure is in
    // For the coordinate system where (0,0) is top-left:
    // - North means smaller Y (top half)
    // - South means larger Y (bottom half)
    // - West means smaller X (left half)
    // - East means larger X (right half)
    let quadrant = "";
    if (treasureLocation.y < 1000) {
      quadrant += "north";
    } else {
      quadrant += "south";
    }
    
    if (treasureLocation.x < 1000) {
      quadrant += "west";
    } else {
      quadrant += "east";
    }
    
    return `Pan around the map to find the hidden treasure. Try searching in the ${quadrant} quadrant of the map, around coordinates (${minX}-${maxX}, ${minY}-${maxY})...`;
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-900 text-white">
      <div className="fixed top-4 left-4 z-10 bg-gray-800 p-4 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Map Panner (Custom)</h1>
        <p className="text-gray-300">
          {isComplete
            ? "You found the treasure!"
            : getHintMessage()}
        </p>
        {isComplete && (
          <div className="mt-4 p-4 bg-green-800 rounded-lg">
            <p className="font-bold">Password: <span id="password">{taskData?.password || PASSWORD_MapPannerCustom}</span></p>
          </div>
        )}
        {isDebug && taskData && (
          <div className="mt-2">
            <p className="text-green-400 mb-2">
              Task loaded from data/map-panner/tasks.jsonl (line {searchQuery.get("lineIndex") || "0"})
            </p>
            <p className="text-blue-400 mb-2">
              Target at ({treasureLocation.x}, {treasureLocation.y})
            </p>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className={`w-full h-full ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            width: "2000px",
            height: "2000px",
          }}
        >
          {/* Map grid background */}
          <div className="absolute inset-0 bg-gray-800">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                backgroundSize: "100px 100px",
              }}
            />
          </div>

          {/* Map markers */}
          {generateMapMarkers()}

          {/* Scanning circle */}
          <div
            className="absolute border-2 border-blue-400 rounded-full opacity-50"
            style={{
              left: viewportCenter.x,
              top: viewportCenter.y,
              width: treasureRadius * 2,
              height: treasureRadius * 2,
              transform: "translate(-50%, -50%)",
              transition: "all 0.1s ease-out",
            }}
          >
            <div className="absolute inset-0 bg-blue-400 opacity-10 rounded-full" />
          </div>

          {/* Hidden treasure (only visible when found) */}
          {isComplete && (
            <div
              className="absolute animate-pulse"
              style={{
                left: treasureLocation.x,
                top: treasureLocation.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <span className="text-6xl">💎</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPannerCustom;
