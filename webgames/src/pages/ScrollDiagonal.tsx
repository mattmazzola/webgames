import React from "react";

export const PASSWORD_ScrollDiagonal = "DIAGONALMASTER2024";

const ScrollDiagonal: React.FC = () => {
  const gridSize = 20;
  const furthestDistance = Math.sqrt(
    Math.pow((gridSize - 1) / gridSize, 2) +
      Math.pow((gridSize - 1) / gridSize, 2)
  );

  const renderBox = (rowIndex: number, colIndex: number) => {
    const distance =
      Math.sqrt(
        Math.pow((gridSize - 1 - rowIndex) / gridSize, 2) +
          Math.pow((gridSize - 1 - colIndex) / gridSize, 2)
      ) / furthestDistance;
    const isLastBox = rowIndex === gridSize - 1 && colIndex === gridSize - 1;
    if (isLastBox) {
      return (
        <div
          key={colIndex}
          className="inline-flex items-center justify-center w-96 h-48 m-3 rounded-lg bg-green-500 text-white"
        >
          <div className="text-center">
            <p>Congratulations! Password:</p>
            <p>{PASSWORD_ScrollDiagonal}</p>
          </div>
        </div>
      );
    }

    return (
      <div
        key={colIndex}
        className="inline-flex items-center justify-center w-96 h-48 m-3 rounded-lg text-gray-600"
        style={{
          backgroundColor: `hsl(${distance * 360}, 70%, 80%)`,
        }}
      >
        <div className="text-center">
          <p>Keep scrolling!</p>
          <p>{Math.round(distance * 100)}% to go...</p>
        </div>
      </div>
    );
  };

  const grid = Array(gridSize)
    .fill(null)
    .map((_, rowIndex) => (
      <div key={rowIndex} className="whitespace-nowrap">
        {Array(gridSize)
          .fill(null)
          .map((_, colIndex) => renderBox(rowIndex, colIndex))}
      </div>
    ));

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 bg-white p-5 border-b z-10">
        <h1 className="text-2xl font-bold">Diagonal Scroll Challenge</h1>
        <p className="mt-2">
          Scroll to the bottom-right corner to reveal the secret password!
        </p>
      </div>

      <div className="mt-24 p-5">{grid}</div>
    </div>
  );
};

export default ScrollDiagonal;
