import { useEffect, useState } from "react";
import "../cryptoTech.css";

export const AnimateSnake = () => {
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: Math.random() * 3294.72,
    left: Math.random() * document.documentElement.scrollWidth,
  });

  const [direction, setDirection] = useState<{ x: number; y: number }>({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
  });

  const calculateAngle = (x: number, y: number) => {
    return Math.atan2(y, x) * (180 / Math.PI);
  };

  useEffect(() => {
    const updatePosition = () => {
      const maxTop = document.documentElement.scrollHeight;
      const maxLeft = document.documentElement.scrollWidth;

      let newTop = position.top + direction.y * 20;
      let newLeft = position.left + direction.x * 20;

      if (newTop < 0 || newTop > maxTop) {
        setDirection((prev) => ({ ...prev, y: -prev.y }));
        newTop = Math.min(maxTop, Math.max(0, newTop));
      }

      if (newLeft < 0 || newLeft > maxLeft) {
        setDirection((prev) => ({ ...prev, x: -prev.x }));
        newLeft = Math.min(maxLeft, Math.max(0, newLeft));
      }

      setPosition({ top: newTop, left: newLeft });
    };

    const interval = setInterval(updatePosition, 150);
    return () => clearInterval(interval);
  }, [position, direction]);

  const angle = calculateAngle(direction.x, direction.y);

  return (
    <div
      className="absolute h-40 w-60 overflow-hidden blur-md"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: `rotate(${angle - 180}deg)`,
        transition: "top 4s linear, left 4s linear, transform 4s linear",
      }}
    >
      <svg viewBox="0 0 50 10" xmlns="http://www.w3.org/2000/svg" className="snake-path">
        <path
          d="M 0 5 Q 15 0, 25 5 T 50 -5 Q 62.5 10, 75 5 T 100 5"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="6"
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            values="
              M 0 5 Q 15 0, 25 5 T 50 -5 Q 60 10, 75 5 T 100 5;
              M 0 0 Q 25 10, 35 5 T 50 10 Q 75 0, 85 5 T 100 5;
              M 0 5 Q 15 0, 25 5 T 50 -5 Q 60 10, 75 5 T 100 5
            "
            dur=".7s"
            repeatCount="indefinite"
          />
        </path>
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "#FF2727", stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: "#243AFF", stopOpacity: 1 }} />
            <stop offset="98%" style={{ stopColor: "#FF12E7", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
