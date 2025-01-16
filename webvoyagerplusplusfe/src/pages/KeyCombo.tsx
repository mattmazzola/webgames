import confetti from "canvas-confetti";
import { useEffect, useState } from "react";

const SUCCESS_PASSWORD = "KEY_MASTER_2024";

const KeyCombo = () => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  // Define the target key combination
  const targetCombo = navigator.platform.toLowerCase().includes("mac")
    ? ["Meta", "Shift", "P"]
    : ["Control", "Shift", "P"];

  const comboDisplay = navigator.platform.toLowerCase().includes("mac")
    ? "Meta + Shift + P"
    : "Control + Shift + P";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key === "Meta" ? "Meta" : e.key;
      const newPressedKeys = new Set([...Array.from(pressedKeys), key]);

      // Only prevent default if it matches our target combo
      const pressedArray = Array.from(newPressedKeys).map((k) =>
        k.toLowerCase()
      );
      const targetArray = targetCombo.map((k) => k.toLowerCase());
      const isTargetCombo = targetArray.every((key) =>
        pressedArray.some(
          (pressed) =>
            pressed === key.toLowerCase() ||
            (key.toLowerCase() === "meta" && pressed === "command") ||
            (key.toLowerCase() === "control" && pressed === "control")
        )
      );

      if (isTargetCombo) {
        e.preventDefault();
      }

      setPressedKeys(newPressedKeys);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key === "Meta" ? "Meta" : e.key;
      setPressedKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    };

    // Check if the pressed combination matches the target
    const checkCombo = () => {
      const pressedArray = Array.from(pressedKeys).map((k) => k.toLowerCase());
      const targetArray = targetCombo.map((k) => k.toLowerCase());

      // Check if all required keys are pressed
      const hasAllKeys = targetArray.every((key) =>
        pressedArray.some(
          (pressed) =>
            pressed === key.toLowerCase() ||
            (key.toLowerCase() === "meta" && pressed === "command") ||
            (key.toLowerCase() === "control" && pressed === "control")
        )
      );

      if (hasAllKeys) {
        setIsComplete(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Check the combo whenever pressed keys change
    checkCombo();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pressedKeys, targetCombo]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-600">
          Key Combo Challenge
        </h1>

        <div className="text-center mb-8">
          <p className="text-lg mb-4">Press the following combination:</p>
          <div className="text-2xl font-mono bg-gray-100 p-4 rounded-lg mb-4">
            {comboDisplay}
          </div>

          <div className="text-sm text-gray-600">
            Currently pressed: {Array.from(pressedKeys).join(" + ") || "None"}
          </div>
        </div>

        {isComplete && (
          <div className="text-center p-4 bg-green-100 text-green-700 rounded-lg">
            <p className="font-bold mb-2">Congratulations! 🎉</p>
            <p>The secret password is: {SUCCESS_PASSWORD}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyCombo;
