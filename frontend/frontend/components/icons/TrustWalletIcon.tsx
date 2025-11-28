import React from 'react';

interface TrustWalletIconProps {
  className?: string;
  size?: number;
}

/**
 * Trust Wallet SVG Icon
 * Official brand colors (Trust Wallet Blue)
 */
export const TrustWalletIcon: React.FC<TrustWalletIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Trust Wallet shield logo */}
      <path
        d="M16 3L5 8V14C5 20.5 9.5 26.5 16 28C22.5 26.5 27 20.5 27 14V8L16 3Z"
        fill="url(#trust-gradient)"
      />
      <path
        d="M16 6L8 10V14C8 19.2 11.5 24 16 25.5C20.5 24 24 19.2 24 14V10L16 6Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="trust-gradient"
          x1="5"
          y1="3"
          x2="27"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3375BB" />
          <stop offset="1" stopColor="#0C65EB" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default TrustWalletIcon;
