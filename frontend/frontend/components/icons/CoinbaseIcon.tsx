import React from 'react';

interface CoinbaseIconProps {
  className?: string;
  size?: number;
}

/**
 * Coinbase Wallet SVG Icon
 * Official brand colors (Coinbase Blue)
 */
export const CoinbaseIcon: React.FC<CoinbaseIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Coinbase logo - blue circle with rounded square */}
      <circle cx="16" cy="16" r="14" fill="#0052FF" />
      <rect
        x="10"
        y="10"
        width="12"
        height="12"
        rx="2"
        fill="white"
      />
    </svg>
  );
};

export default CoinbaseIcon;
