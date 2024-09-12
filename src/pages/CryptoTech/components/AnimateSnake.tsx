import "../cryptoTech.css";

export const AnimateSnake = () => {
  return (
    <div className="absolute bottom-[20rem] left-0 h-16 w-full overflow-hidden">
      <svg viewBox="0 0 50 10" xmlns="http://www.w3.org/2000/svg" className="snake-path">
        <path
          d="M 0 5 Q 15 0, 25 5 T 50 -5 Q 62.5 10, 75 5 T 100 5"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="4"
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
