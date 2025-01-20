import { useEffect, useState } from "react";

const ScrollDiagonal = () => {
  const [hasReachedTarget, setHasReachedTarget] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const verticalProgress =
        window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight);
      const horizontalProgress =
        window.scrollX /
        (document.documentElement.scrollWidth - window.innerWidth);

      // Only reveal password when user has scrolled at least 90% in both directions
      if (verticalProgress > 0.9 && horizontalProgress > 0.9) {
        setHasReachedTarget(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generate content grid
  const gridSize = 20;
  const grid = Array(gridSize)
    .fill(null)
    .map((_, rowIndex) => (
      <div key={rowIndex} style={{ whiteSpace: "nowrap" }}>
        {Array(gridSize)
          .fill(null)
          .map((_, colIndex) => {
            const distance = Math.sqrt(
              Math.pow(rowIndex / gridSize, 2) +
                Math.pow(colIndex / gridSize, 2)
            );
            return (
              <div
                key={colIndex}
                style={{
                  width: "200px",
                  height: "200px",
                  display: "inline-flex",
                  margin: "10px",
                  backgroundColor: `hsl(${distance * 360}, 70%, 80%)`,
                  borderRadius: "8px",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#444",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                Keep scrolling diagonally!
                <br />
                {Math.round((1 - distance) * 100)}% to go...
              </div>
            );
          })}
      </div>
    ));

  return (
    <div>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          padding: "20px",
          zIndex: 1,
          borderBottom: "1px solid #ddd",
        }}
      >
        <h1>Diagonal Scroll Challenge</h1>
        <p>Scroll to the bottom-right corner to reveal the secret password!</p>
      </div>

      <div style={{ marginTop: "100px", padding: "20px" }}>
        {grid}

        {hasReachedTarget && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              padding: "20px",
              backgroundColor: "#4CAF50",
              color: "white",
              borderRadius: "8px",
              textAlign: "center",
              zIndex: 2,
            }}
          >
            <div>Congratulations! You've reached the target!</div>
            <div
              style={{
                marginTop: "10px",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              Password: DIAGONALMASTER2024
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrollDiagonal;
