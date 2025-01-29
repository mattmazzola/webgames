import { useCallback, useEffect, useState } from "react";

export const PASSWORD_FrogCrossing = "HOPPY_CROSSING";

interface Position {
  x: number;
  y: number;
}

interface Car {
  x: number;
  y: number;
  direction: "left" | "right";
  speed: number;
}

const GRID_SIZE = 15;
const CAR_ROWS = [3, 6, 9, 12];
const CARS_PER_ROW = 3;

export default function FrogCrossing() {
  const [frog, setFrog] = useState<Position>({
    x: Math.floor(GRID_SIZE / 2),
    y: GRID_SIZE - 1,
  });
  const [cars, setCars] = useState<Car[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [success, setSuccess] = useState(false);

  // Initialize cars
  useEffect(() => {
    const initialCars: Car[] = [];
    CAR_ROWS.forEach((row, index) => {
      for (let i = 0; i < CARS_PER_ROW; i++) {
        initialCars.push({
          x: Math.floor(Math.random() * GRID_SIZE),
          y: row,
          direction: index % 2 === 0 ? "left" : "right",
          speed: 1 + Math.random(),
        });
      }
    });
    setCars(initialCars);
  }, []);

  // Move cars
  useEffect(() => {
    if (gameOver || success) return;

    const interval = setInterval(() => {
      setCars((prevCars) =>
        prevCars.map((car) => {
          let newX =
            car.direction === "left" ? car.x - car.speed : car.x + car.speed;

          // Wrap around
          if (newX < 0) newX = GRID_SIZE - 1;
          if (newX >= GRID_SIZE) newX = 0;

          return { ...car, x: newX };
        })
      );
    }, 200);

    return () => clearInterval(interval);
  }, [gameOver, success]);

  // Check collisions and win condition
  useEffect(() => {
    // Check for collisions
    const collision = cars.some(
      (car) => Math.abs(car.x - frog.x) < 1 && car.y === frog.y
    );

    if (collision) {
      setGameOver(true);
    }

    // Check for win condition (reached top)
    if (frog.y === 0) {
      setSuccess(true);
    }
  }, [frog, cars]);

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver || success) return;

      setFrog((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        switch (e.key) {
          case "ArrowUp":
            newY = Math.max(0, prev.y - 1);
            break;
          case "ArrowDown":
            newY = Math.min(GRID_SIZE - 1, prev.y + 1);
            break;
          case "ArrowLeft":
            newX = Math.max(0, prev.x - 1);
            break;
          case "ArrowRight":
            newX = Math.min(GRID_SIZE - 1, prev.x + 1);
            break;
        }

        return { x: newX, y: newY };
      });
    },
    [gameOver, success]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 p-4">
      <div className="mb-4 text-xl">
        {gameOver ? (
          <div className="text-red-500">Game Over! Press R to restart</div>
        ) : success ? (
          <div className="text-green-500">
            Success! The password is: {PASSWORD_FrogCrossing}
          </div>
        ) : (
          <div>Use arrow keys to guide the frog home!</div>
        )}
      </div>

      <div
        className="grid gap-1 bg-blue-200 p-4 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          width: `${GRID_SIZE * 30}px`,
          height: `${GRID_SIZE * 30}px`,
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const isFrog = x === frog.x && y === frog.y;
          const car = cars.find((c) => Math.floor(c.x) === x && c.y === y);

          return (
            <div
              key={index}
              className={`w-full h-full flex items-center justify-center
                ${y === 0 ? "bg-green-300" : ""}`}
            >
              {isFrog ? "🐸" : car ? "🚗" : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
