import React from "react";

export const PASSWORD_ScrollHorizontal = "SIDEWAYSCROLL2024";

const ScrollHorizontal: React.FC = () => {
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
              Password: {PASSWORD_ScrollHorizontal}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollHorizontal;
