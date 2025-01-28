import { useEffect, useState } from "react";

export const PASSWORD_SliderSymphony = "SMOOTHSLIDER42";

const SliderSymphony = () => {
  const [sliderValues, setSliderValues] = useState([50, 50, 50, 50]);
  const [targetPositions] = useState(() => {
    // Generate random target positions between 100 and 400
    return Array.from(
      { length: 4 },
      () => Math.floor(Math.random() * 300) + 100
    );
  });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check if all boxes are aligned (within 10px margin of error)
    const aligned = sliderValues.every(
      (value, index) =>
        Math.abs(getBoxPosition(value) - targetPositions[index]) < 10
    );
    setIsComplete(aligned);
  }, [sliderValues, targetPositions]);

  const handleSliderChange = (index: number, value: number) => {
    const newValues = [...sliderValues];
    newValues[index] = value;
    setSliderValues(newValues);
  };

  // Convert slider value (0-100) to box position (0-500)
  const getBoxPosition = (value: number) => {
    return value * 5; // This gives us a range of 0-500px
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Slider Symphony</h1>

      {/* Fixed height container for success message */}
      <div className="h-20 flex items-center">
        <div
          className={`transition-opacity duration-500 ${
            isComplete ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="p-4 bg-green-100 text-green-700 rounded-lg">
            <div>🎉 Congratulations! You've aligned all the boxes!</div>
            {isComplete && (
              <div className="mt-2 text-sm font-mono">
                Secret password: {PASSWORD_SliderSymphony}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-32 relative">
        {/* Sliders container */}
        <div className="flex gap-12">
          {sliderValues.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <input
                type="range"
                value={value}
                onChange={(e) =>
                  handleSliderChange(index, parseInt(e.target.value))
                }
                className="h-64 -rotate-180"
                min="0"
                max="100"
                step="1"
                style={{ writingMode: "vertical-lr" }}
              />
            </div>
          ))}
        </div>

        {/* Boxes container */}
        <div className="relative w-96 h-[600px]">
          {sliderValues.map((value, index) => (
            <div key={index} className="absolute left-0 w-full">
              {/* Moving box */}
              <div
                className="w-12 h-12 rounded-lg shadow-lg absolute"
                style={{
                  backgroundColor: isComplete ? "#4ade80" : "#60a5fa",
                  top: `${getBoxPosition(value)}px`,
                  left: `${index * 60}px`,
                }}
              />
              {/* Target box */}
              <div
                className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-400 absolute"
                style={{
                  top: `${targetPositions[index]}px`,
                  left: `${index * 60}px`,
                  opacity: 0.5,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 text-gray-600">
        <p>
          Align the colored boxes with their dashed outlines by adjusting the
          sliders.
        </p>
        <p className="text-sm mt-2">
          Tip: The boxes need to be very close to their targets to count as
          aligned!
        </p>
      </div>
    </div>
  );
};

export default SliderSymphony;
