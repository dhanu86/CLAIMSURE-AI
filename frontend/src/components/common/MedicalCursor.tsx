import React, { useEffect, useState } from 'react';

export const MedicalCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering over clickable elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer, table tr');
        setIsHovered(!!interactive);
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  // Smooth trailing spring effect
  useEffect(() => {
    if (isTouchDevice) return;
    let animationFrameId: number;

    const followMouse = () => {
      setTrailingPos((prev) => {
        const dx = pos.x - prev.x;
        const dy = pos.y - prev.y;
        return {
          x: prev.x + dx * 0.18,
          y: prev.y + dy * 0.18,
        };
      });
      animationFrameId = requestAnimationFrame(followMouse);
    };

    animationFrameId = requestAnimationFrame(followMouse);
    return () => cancelAnimationFrame(animationFrameId);
  }, [pos, isTouchDevice]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300">
      {/* 1. Precision Medical Cross Center */}
      <div
        className="fixed -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: `translate(-50%, -50%) scale(${isClicked ? 0.8 : isHovered ? 1.25 : 1})`,
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_8px_rgba(45,150,130,0.6)]"
        >
          {/* Medical Cross Arms */}
          <path
            d="M12 4V20M4 12H20"
            stroke={isHovered ? "#0D9488" : "#262523"}
            strokeWidth={isHovered ? "2.5" : "1.8"}
            strokeLinecap="round"
          />
          {/* Central Vital Core */}
          <circle
            cx="12"
            cy="12"
            r={isHovered ? "3" : "2"}
            fill={isHovered ? "#0D9488" : "#A89586"}
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* 2. Trailing Medical Radar / Pulse Ring */}
      <div
        className="fixed -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-150"
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
          width: isHovered ? '48px' : isClicked ? '22px' : '36px',
          height: isHovered ? '48px' : isClicked ? '22px' : '36px',
          borderColor: isHovered ? 'rgba(13, 148, 136, 0.55)' : 'rgba(168, 149, 134, 0.35)',
          backgroundColor: isHovered ? 'rgba(13, 148, 136, 0.08)' : 'transparent',
          boxShadow: isHovered
            ? '0 0 16px rgba(13, 148, 136, 0.3), inset 0 0 8px rgba(13, 148, 136, 0.15)'
            : '0 0 8px rgba(220, 199, 184, 0.2)',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Cardiac Rhythm Tick Marks on Radar Ring */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
            <span className="absolute -top-1 w-1.5 h-1.5 bg-teal-600 rounded-full shadow-[0_0_6px_#0D9488]" />
            <span className="absolute -bottom-1 w-1 h-1 bg-teal-400 rounded-full" />
          </div>
        )}
      </div>

      {/* 3. Ripple Ring on Click (Heartbeat contraction) */}
      {isClicked && (
        <div
          className="fixed -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping border border-teal-500"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: '40px',
            height: '40px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
};
