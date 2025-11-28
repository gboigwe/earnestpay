import React from 'react';

interface ArbitrumIconProps {
  className?: string;
  size?: number;
}

/**
 * Arbitrum Network Icon
 * Official Arbitrum logo colors
 */
export const ArbitrumIcon: React.FC<ArbitrumIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="14" fill="#28A0F0" opacity="0.1" />
      <path
        d="M16 6L24 13V23L16 30L8 23V13L16 6Z"
        stroke="#28A0F0"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M16 11L20 14V22L16 25L12 22V14L16 11Z"
        fill="#28A0F0"
      />
    </svg>
  );
};

export default ArbitrumIcon;
