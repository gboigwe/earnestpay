import React from 'react';

interface RainbowIconProps {
  className?: string;
  size?: number;
}

/**
 * Rainbow Wallet SVG Icon
 * Colorful rainbow gradient design
 */
export const RainbowIcon: React.FC<RainbowIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rainbow arcs */}
      <g transform="translate(16, 24)">
        {/* Outer arc - red */}
        <path
          d="M -12 0 A 12 12 0 0 1 12 0"
          stroke="#FF5470"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Middle-outer arc - orange */}
        <path
          d="M -9 0 A 9 9 0 0 1 9 0"
          stroke="#FF9838"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Middle arc - yellow */}
        <path
          d="M -6 0 A 6 6 0 0 1 6 0"
          stroke="#FFC839"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Inner arc - green/blue */}
        <path
          d="M -3 0 A 3 3 0 0 1 3 0"
          stroke="#01D3B5"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      {/* Background circle */}
      <circle cx="16" cy="16" r="15" fill="#174299" opacity="0.1" />
    </svg>
  );
};

export default RainbowIcon;
