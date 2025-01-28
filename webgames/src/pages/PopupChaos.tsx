import React, { useCallback, useEffect, useState } from "react";

export const PASSWORD_PopupChaos = "PopupSlayer2024";

interface Popup {
  id: number;
  x: number;
  y: number;
  title: string;
  content: string;
  isDragging: boolean;
  offsetX: number;
  offsetY: number;
  cta: {
    text: string;
    className: string;
  };
}

const MAX_POPUPS = 8; // Maximum number of popups allowed at once
const BASE_Z_INDEX = 100; // Base z-index for popups

const PopupChaos: React.FC = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [spawnInterval, setSpawnInterval] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [hasInitialPopups, setHasInitialPopups] = useState(false);

  const bringToFront = useCallback((id: number) => {
    setPopups((prev) => {
      const popupIndex = prev.findIndex((p) => p.id === id);
      if (popupIndex === -1) return prev;

      const newPopups = [...prev];
      const [popup] = newPopups.splice(popupIndex, 1);
      return [...newPopups, popup];
    });
  }, []);

  const createPopup = useCallback((x?: number, y?: number) => {
    setPopups((prev) => {
      // Don't create new popups if we're at the limit
      if (prev.length >= MAX_POPUPS) {
        return prev;
      }

      const titles = [
        "Important Update!",
        "Special Offer!",
        "Breaking News!",
        "Don't Miss Out!",
        "Act Now!",
        "Limited Time!",
        "System Warning!",
        "Security Alert!",
        "Update Required!",
      ];
      const contents = [
        "Click here to claim your prize! Our records show you've been selected for a special reward. Don't let this opportunity pass you by!",
        "You're the 1,000,000th visitor! We've been trying to reach you about your computer's extended warranty.",
        "Your computer needs attention! Critical system updates are available. Click here to optimize your system now!",
        "Download more RAM now! Our advanced technology allows you to instantly upgrade your computer's memory. Try it now!",
        "Hot singles in your area! They're waiting to meet someone just like you. Don't keep them waiting any longer!",
        "You've won a free iPhone! Plus a free tablet, laptop, and smart TV. Click now to claim your prizes!",
        "Warning: Your system is running low on resources! Click here for an instant performance boost.",
        "🎉 Congratulations! You've been selected for our exclusive offer. Limited time only - act fast!",
        "⚠️ System Alert: Multiple issues detected! Click here for an instant fix to all your problems.",
      ];
      const ctas = [
        { text: "Learn More", className: "bg-blue-500 hover:bg-blue-600" },
        { text: "Get Started", className: "bg-indigo-500 hover:bg-indigo-600" },
        {
          text: "Yes, I'm Interested!",
          className: "bg-pink-500 hover:bg-pink-600",
        },
        { text: "Install Now", className: "bg-orange-500 hover:bg-orange-600" },
        { text: "Continue", className: "bg-teal-500 hover:bg-teal-600" },
        { text: "Accept Offer", className: "bg-cyan-500 hover:bg-cyan-600" },
        {
          text: "Close all popups",
          className: "bg-green-500 hover:bg-green-600",
        },
      ];

      const randomCta = ctas[Math.floor(Math.random() * ctas.length)];

      const newPopup: Popup = {
        id: Date.now() + Math.random(),
        x: x ?? Math.random() * (window.innerWidth - 400),
        y: y ?? Math.random() * (window.innerHeight - 300),
        title: titles[Math.floor(Math.random() * titles.length)],
        content: contents[Math.floor(Math.random() * contents.length)],
        isDragging: false,
        offsetX: 0,
        offsetY: 0,
        cta: randomCta,
      };

      return [...prev, newPopup];
    });
  }, []);

  // Create initial popups that cover the password
  useEffect(() => {
    if (!hasInitialPopups) {
      // Center coordinates (where the password would be)
      const centerX = window.innerWidth / 2 - 200;
      const centerY = window.innerHeight / 2 - 150;

      // Create popups with more variance around the center
      const positions = [
        // Top-left quadrant
        [centerX - Math.random() * 300, centerY - Math.random() * 300],
        // Top-right quadrant
        [centerX + Math.random() * 300, centerY - Math.random() * 300],
        // Bottom-left quadrant
        [centerX - Math.random() * 300, centerY + Math.random() * 300],
        // Bottom-right quadrant
        [centerX + Math.random() * 300, centerY + Math.random() * 300],
        // Random position with wider range
        [
          centerX + (Math.random() - 0.5) * 500,
          centerY + (Math.random() - 0.5) * 500,
        ],
      ];

      // Ensure positions are within viewport bounds
      const boundedPositions = positions.map(([x, y]) => [
        Math.max(0, Math.min(x, window.innerWidth - 400)),
        Math.max(0, Math.min(y, window.innerHeight - 300)),
      ]);

      // Create popups with unique IDs
      boundedPositions.forEach(([x, y]) => createPopup(x, y));
      setHasInitialPopups(true);
    }
  }, [hasInitialPopups, createPopup]);

  // Start spawning new popups after initial ones are created
  useEffect(() => {
    if (hasInitialPopups && !spawnInterval && !isComplete) {
      const interval = setInterval(() => {
        setPopups((prev) => {
          if (prev.length < MAX_POPUPS) {
            // Add more variance to spawned popups
            const x = Math.random() * (window.innerWidth - 400);
            const y = Math.random() * (window.innerHeight - 300);
            createPopup(x, y);
          }
          return prev;
        });
      }, 2000);
      setSpawnInterval(interval);
      return () => clearInterval(interval);
    }
  }, [hasInitialPopups, createPopup, spawnInterval, isComplete]);

  const handleMouseDown = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); // Prevent text selection while dragging
    const popup = e.currentTarget.getBoundingClientRect();
    bringToFront(id);
    setPopups((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isDragging: true,
              offsetX: e.clientX - popup.left,
              offsetY: e.clientY - popup.top,
            }
          : p
      )
    );
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection while dragging
    setPopups((prev) =>
      prev.map((p) =>
        p.isDragging
          ? {
              ...p,
              x: Math.max(
                0,
                Math.min(e.clientX - p.offsetX, window.innerWidth - 400)
              ),
              y: Math.max(
                0,
                Math.min(e.clientY - p.offsetY, window.innerHeight - 300)
              ),
            }
          : p
      )
    );
  }, []);

  const handleMouseUp = useCallback(() => {
    setPopups((prev) => prev.map((p) => ({ ...p, isDragging: false })));
  }, []);

  const closePopup = useCallback(
    (id: number) => {
      setPopups((prev) => {
        const newPopups = prev.filter((p) => p.id !== id);
        if (newPopups.length === 0) {
          setIsComplete(true);
          if (spawnInterval) {
            clearInterval(spawnInterval);
          }
        }
        return newPopups;
      });
    },
    [spawnInterval]
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Instructions Card */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl p-6 max-w-2xl shadow-sm">
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Popup Chaos
          </h1>
          <p className="text-center text-gray-600">
            Close or move all the popup windows to reveal the secret password!
            But hurry - more keep appearing!
          </p>
        </div>
      </div>

      {/* Password Window */}
      {isComplete && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl"
          style={{ zIndex: 0 }}
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Secret Password</h2>
            <p className="text-lg">{PASSWORD_PopupChaos}</p>
          </div>
        </div>
      )}

      {/* Popup Windows */}
      {popups.map((popup, index) => (
        <div
          key={popup.id}
          className="fixed bg-white rounded-lg shadow-2xl w-[400px] border border-gray-200"
          style={{
            left: popup.x,
            top: popup.y,
            zIndex: BASE_Z_INDEX + index,
            cursor: popup.isDragging ? "grabbing" : "grab",
            transform: `scale(${popup.isDragging ? 1.02 : 1})`,
            transition: "transform 0.1s ease-out, box-shadow 0.1s ease-out",
            boxShadow: popup.isDragging
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              : "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div className="bg-gray-800 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div
              className="flex-1 cursor-grab"
              onMouseDown={(e) => handleMouseDown(e, popup.id)}
            >
              <span className="font-semibold text-lg">{popup.title}</span>
            </div>
            <button
              className="text-gray-300 hover:text-white focus:outline-none text-xl font-bold ml-4"
              onClick={() => closePopup(popup.id)}
            >
              ✕
            </button>
          </div>
          <div className="p-6">
            <p className="text-lg leading-relaxed">{popup.content}</p>
            <div className="mt-4 flex justify-end">
              <button
                className={`${popup.cta.className} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                onClick={(e) => e.preventDefault()}
              >
                {popup.cta.text}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Completion Message */}
      {isComplete && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-200 rounded-lg p-4 shadow-lg">
          <p className="text-green-800 font-medium">
            Congratulations! You've defeated the popup invasion!
          </p>
          <p className="text-green-800 font-medium">
            The password is: {PASSWORD_PopupChaos}
          </p>
        </div>
      )}
    </div>
  );
};

export default PopupChaos;
