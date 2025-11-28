import React from 'react';

interface EthereumIconProps {
  className?: string;
  size?: number;
}

/**
 * Ethereum Network Icon
 * Official Ethereum logo
 */
export const EthereumIcon: React.FC<EthereumIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g opacity="0.8">
        {/* Ethereum diamond */}
        <path
          d="M16 4L15.8 4.7V20.3L16 20.5L23 16.2L16 4Z"
          fill="#627EEA"
        />
        <path
          d="M16 4L9 16.2L16 20.5V4Z"
          fill="#A9B8E8"
        />
        <path
          d="M16 22L15.9 22.1V27L16 27.3L23 17.7L16 22Z"
          fill="#627EEA"
        />
        <path
          d="M16 27.3V22L9 17.7L16 27.3Z"
          fill="#A9B8E8"
        />
        <path
          d="M16 20.5L23 16.2L16 12.6V20.5Z"
          fill="#434F7D"
        />
        <path
          d="M9 16.2L16 20.5V12.6L9 16.2Z"
          fill="#8196DC"
        />
      </g>
    </svg>
  );
};

export default EthereumIcon;
