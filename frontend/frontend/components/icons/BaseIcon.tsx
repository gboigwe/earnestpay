import React from 'react';

interface BaseIconProps {
  className?: string;
  size?: number;
}

/**
 * Base Network Icon
 * Official Base (Coinbase L2) logo
 */
export const BaseIcon: React.FC<BaseIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="14" fill="#0052FF" />
      <path
        d="M16 8C11.6 8 8 11.6 8 16C8 20.4 11.6 24 16 24C19.2 24 22 22 23.2 19.2H16V12.8H23.2C22 10 19.2 8 16 8Z"
        fill="white"
      />
    </svg>
  );
};

export default BaseIcon;
