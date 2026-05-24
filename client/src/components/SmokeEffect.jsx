import { useEffect } from "react";

export default function SmokeEffect() {
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.textContent = `
      @keyframes smokePuff {
        0%   { transform: scale(0.3) translate(0,0); opacity: 0.7; }
        40%  { opacity: 0.4; }
        100% { transform: scale(2.5) translate(var(--tx), var(--ty)); opacity: 0; }
      }
    `;
    document.head.appendChild(styleTag);

    const spawn = (cx, cy, count = 12) => {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const puff = document.createElement("div");
          const size = 14 + Math.random() * 22;
          const tx = (Math.random() - 0.5) * 80;
          const ty = -(30 + Math.random() * 60);

          Object.assign(puff.style, {
            position: "fixed",
            borderRadius: "50%",
            background: "rgba(160,160,160,0.55)",
            width: size + "px",
            height: size + "px",
            left: cx - size / 2 + (Math.random() - 0.5) * 30 + "px",
            top: cy - size / 2 + (Math.random() - 0.5) * 20 + "px",
            pointerEvents: "none",
            zIndex: "9999",
            animation: `smokePuff ${0.9 + Math.random() * 0.6}s ease-out forwards`,
            "--tx": tx + "px",
            "--ty": ty + "px",
          });

          document.body.appendChild(puff);
          setTimeout(() => puff.remove(), 1600);
        }, i * 45);
      }
    };

    const handler = (e) => {
      const tag = e.target.tagName;
      const count = tag === "BUTTON" || tag === "A" ? 18 : 8;
      spawn(e.clientX, e.clientY, count);
    };

    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler);
      styleTag.remove();
    };
  }, []);

  return null;
}