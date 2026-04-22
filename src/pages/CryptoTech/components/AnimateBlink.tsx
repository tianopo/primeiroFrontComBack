import { useEffect, useState } from "react";

interface IAnimateBlink {
  color?: string;
  ballSize: number;
}

const BRAND_COLORS = {
  yellow: "#FFC83D",
  orange: "#FF8A1F",
  silver: "#BFC7D1",
  white: "#F5F7FA",
  black: "#0A0A0A",
};

const blinkPalette = [
  BRAND_COLORS.yellow,
  BRAND_COLORS.orange,
  BRAND_COLORS.silver,
  BRAND_COLORS.white,
];

export const AnimateBlink = ({ color, ballSize }: IAnimateBlink) => {
  const [blinkColor, setBlinkColor] = useState(
    color || blinkPalette[Math.floor(Math.random() * blinkPalette.length)],
  );

  const [position, setPosition] = useState<{ top: string; left: string }>({
    top: `${Math.random() * (3294.72 - ballSize)}px`,
    left: `${Math.random() * (document.documentElement.scrollWidth - ballSize)}px`,
  });

  useEffect(() => {
    const updatePosition = () => {
      const maxTop = document.documentElement.scrollHeight - ballSize;
      const maxLeft = document.documentElement.scrollWidth - ballSize;

      const randomTop = Math.random() * maxTop;
      const randomLeft = Math.random() * maxLeft;

      setPosition({
        top: `${randomTop}px`,
        left: `${randomLeft}px`,
      });

      if (!color) {
        setBlinkColor(blinkPalette[Math.floor(Math.random() * blinkPalette.length)]);
      }
    };

    updatePosition();

    const interval = setInterval(updatePosition, 60000);
    return () => clearInterval(interval);
  }, [ballSize, color]);

  return (
    <div
      className="animate-blink absolute rounded-full blur-sm"
      style={{
        top: position.top,
        left: position.left,
        height: `${ballSize}px`,
        width: `${ballSize}px`,
        background: `radial-gradient(circle at 30% 30%, ${BRAND_COLORS.white} 0%, ${blinkColor} 45%, transparent 100%)`,
        boxShadow: `
          0 0 12px ${blinkColor},
          0 0 24px ${blinkColor}66,
          0 0 36px ${blinkColor}33
        `,
        opacity: 0.85,
      }}
    />
  );
};
