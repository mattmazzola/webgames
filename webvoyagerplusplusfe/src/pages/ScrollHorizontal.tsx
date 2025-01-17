import { useEffect, useState } from "react";

const ScrollHorizontal = () => {
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollX;
      const maxScroll =
        document.documentElement.scrollWidth - window.innerWidth;

      if (scrollPosition >= maxScroll) {
        setHasReachedEnd(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generate content boxes
  const boxes = Array(50)
    .fill(null)
    .map((_, index) => (
      <div
        key={index}
        style={{
          width: "300px",
          height: "80vh",
          display: "inline-flex",
          margin: "20px",
          backgroundColor: `hsl(${(index * 7) % 360}, 70%, 80%)`,
          borderRadius: "8px",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          color: "#444",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
        }}
      >
        Keep scrolling! {50 - index} boxes to go...
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
        <h1>Scroll to the Right</h1>
        <p>Keep scrolling horizontally to reveal the secret password!</p>
      </div>

      <div
        style={{
          marginTop: "100px",
          whiteSpace: "nowrap",
          overflowX: "auto",
          padding: "20px",
        }}
      >
        {boxes}

        {hasReachedEnd && (
          <div
            style={{
              width: "300px",
              height: "80vh",
              display: "inline-flex",
              margin: "20px",
              backgroundColor: "#4CAF50",
              color: "white",
              borderRadius: "8px",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            <div
              style={{
                transform: "rotate(-90deg)",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              <div>Congratulations! You've reached the end!</div>
              <div
                style={{
                  marginTop: "20px",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                Password: SIDEWAYSCROLL2024
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrollHorizontal;
