import { useState } from "react";

interface Disk {
  size: number;
  color: string;
}

type Peg = Disk[];

const TowersOfHanoi = () => {
  const colors = ["red", "orange", "yellow", "green", "blue"];
  const numDisks = 5;

  // Initialize pegs with a proper initial state
  const [pegs, setPegs] = useState<Peg[]>([
    // First peg with all disks
    Array.from({ length: numDisks }, (_, i) => ({
      size: numDisks - i,
      color: colors[numDisks - 1 - i],
    })),
    [], // Second peg (empty)
    [], // Third peg (empty)
  ]);

  const [showPassword, setShowPassword] = useState(false);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);

  const isValidMove = (fromPeg: number, toPeg: number): boolean => {
    if (pegs[fromPeg].length === 0) return false;
    if (pegs[toPeg].length === 0) return true;
    const fromDisk = pegs[fromPeg][pegs[fromPeg].length - 1];
    const toDisk = pegs[toPeg][pegs[toPeg].length - 1];
    return fromDisk.size < toDisk.size;
  };

  const handlePegClick = (pegIndex: number) => {
    if (selectedPeg === null) {
      if (pegs[pegIndex].length > 0) {
        setSelectedPeg(pegIndex);
      }
    } else {
      if (pegIndex !== selectedPeg && isValidMove(selectedPeg, pegIndex)) {
        setPegs((currentPegs) => {
          const newPegs = currentPegs.map((peg) => [...peg]);
          const disk = newPegs[selectedPeg].pop();
          if (disk) {
            newPegs[pegIndex].push(disk);
          }
          return newPegs;
        });
        setMoves((prev) => prev + 1);

        // Check win condition
        if (pegIndex === 2 && pegs[2].length === numDisks - 1) {
          setShowPassword(true);
        }
      }
      setSelectedPeg(null);
    }
  };

  const renderPeg = (pegIndex: number) => {
    return (
      <div className="flex flex-col items-center">
        <div
          className={`h-48 flex flex-col-reverse items-center mb-2 relative ${
            selectedPeg === pegIndex ? "bg-gray-100" : ""
          }`}
          style={{ width: "200px" }}
        >
          {pegs[pegIndex].map((disk, index) => (
            <div
              key={disk.size}
              className={`absolute transition-all duration-300`}
              style={{
                width: `${disk.size * 30}px`,
                height: "20px",
                backgroundColor: disk.color,
                bottom: `${index * 24}px`,
                borderRadius: "4px",
              }}
            />
          ))}
          <div
            className="absolute h-full w-4 bg-gray-600 rounded-sm"
            style={{ bottom: "0" }}
          />
        </div>
        <button
          onClick={() => handlePegClick(pegIndex)}
          className={`px-4 py-2 rounded ${
            selectedPeg === pegIndex
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {selectedPeg === pegIndex ? "Selected" : "Select"}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Towers of Hanoi</h2>
        <div className="mb-4">
          <p className="text-gray-700">
            Move all the disks from the leftmost peg to the rightmost peg.
            Rules:
            <ul className="list-disc list-inside">
              <li>Only one disk can be moved at a time</li>
              <li>A larger disk cannot be placed on top of a smaller disk</li>
              <li>
                Click a peg to select it, then click another peg to move the top
                disk
              </li>
            </ul>
          </p>
        </div>
        <div className="flex justify-between items-end mb-8 mt-12">
          {renderPeg(0)}
          {renderPeg(1)}
          {renderPeg(2)}
        </div>
        <div className="text-center text-lg font-semibold">Moves: {moves}</div>
        {showPassword && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 font-medium">
              Congratulations! Secret Password: RecursionMasterTower
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TowersOfHanoi;
