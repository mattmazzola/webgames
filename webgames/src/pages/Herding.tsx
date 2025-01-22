import { useEffect, useRef, useState } from "react";

interface Sheep {
  x: number;
  y: number;
  vx: number;
  vy: number;
  id: number;
}

interface Pen {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const PASSWORD_Herding = "HerdTooMuch";

const Herding = () => {
  const [sheep, setSheep] = useState<Sheep[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const pen: Pen = { x: 700, y: 300, width: 150, height: 150 };

  // Initialize sheep positions
  useEffect(() => {
    const initialSheep: Sheep[] = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * 300 + 50, // Start on the left side
      y: Math.random() * 500 + 50,
      vx: 0,
      vy: 0,
      id: i,
    }));
    setSheep(initialSheep);
  }, []);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => container.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  // Animation loop
  useEffect(() => {
    const updateSheep = () => {
      setSheep((prevSheep) => {
        return prevSheep.map((sheep) => {
          // Calculate distance from mouse
          const dx = sheep.x - mousePos.x;
          const dy = sheep.y - mousePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Apply repulsion force if mouse is close
          const repulsionRadius = 100;
          let ax = 0;
          let ay = 0;

          if (distance < repulsionRadius) {
            const force = (1 - distance / repulsionRadius) * 0.5;
            ax += (dx / distance) * force;
            ay += (dy / distance) * force;
          }

          // Update velocity with damping
          const damping = 0.95;
          const newVx = (sheep.vx + ax) * damping;
          const newVy = (sheep.vy + ay) * damping;

          // Update position with boundary checking
          const margin = 20; // Keep sheep slightly inside the borders
          const newX = Math.max(
            margin,
            Math.min(800 - margin, sheep.x + newVx)
          );
          const newY = Math.max(
            margin,
            Math.min(600 - margin, sheep.y + newVy)
          );

          // If sheep hit boundaries, reverse velocity
          const vx =
            newX === margin || newX === 800 - margin ? -newVx * 0.5 : newVx;
          const vy =
            newY === margin || newY === 600 - margin ? -newVy * 0.5 : newVy;

          return {
            ...sheep,
            x: newX,
            y: newY,
            vx,
            vy,
          };
        });
      });

      // Check if sheep are in the pen
      const sheepInPen = sheep.filter(
        (s) =>
          s.x > pen.x &&
          s.x < pen.x + pen.width &&
          s.y > pen.y &&
          s.y < pen.y + pen.height
      ).length;

      setScore(sheepInPen);

      // Check for victory
      if (sheepInPen === sheep.length && sheep.length > 0) {
        setHasWon(true);
      }

      frameRef.current = requestAnimationFrame(updateSheep);
    };

    frameRef.current = requestAnimationFrame(updateSheep);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [mousePos]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-green-100">
      {hasWon ? (
        <div className="text-center">
          <div className="text-4xl mb-4 text-green-600">
            🎉 Congratulations! 🎉
          </div>
          <div className="text-2xl mb-8">All sheep are safely in the pen!</div>
          <div className="text-xl bg-yellow-100 p-4 rounded-lg border-2 border-yellow-400">
            The secret password is:{" "}
            <span className="font-bold">{PASSWORD_Herding}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-2 text-2xl">
            Sheep in pen: {score} / {sheep.length}
          </div>
          <div
            ref={containerRef}
            className="relative w-[800px] h-[600px] border-4 border-green-800 bg-green-200 overflow-hidden"
          >
            {/* Pen */}
            <div
              className="absolute border-4 border-brown-600 bg-yellow-100"
              style={{
                left: pen.x,
                top: pen.y,
                width: pen.width,
                height: pen.height,
              }}
            />

            {/* Sheep */}
            {sheep.map((sheep) => (
              <div
                key={sheep.id}
                className="absolute text-4xl transition-transform duration-100"
                style={{
                  left: sheep.x,
                  top: sheep.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                🐑
              </div>
            ))}
          </div>
          <div className="mt-4 text-lg text-gray-700">
            Use your cursor to herd the sheep into the pen!
          </div>
        </>
      )}
    </div>
  );
};

export default Herding;
