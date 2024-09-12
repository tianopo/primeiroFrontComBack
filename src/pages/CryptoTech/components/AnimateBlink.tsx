import { useEffect, useState } from "react";

interface IAnimateBlink {
  color: string;
  ballSize: number;
}

export const AnimateBlink = ({ color, ballSize }: IAnimateBlink) => {
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
    };
    updatePosition();

    const interval = setInterval(updatePosition, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`animate-blink absolute rounded-full blur-sm`}
      style={{
        top: position.top,
        left: position.left,
        backgroundColor: color, // Aplica a cor dinamicamente
        height: `${ballSize}px`, // Define o tamanho dinamicamente
        width: `${ballSize}px`,
      }}
    ></div>
  );
};
