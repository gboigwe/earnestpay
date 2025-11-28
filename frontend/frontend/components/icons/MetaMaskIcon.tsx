import React from 'react';

interface MetaMaskIconProps {
  className?: string;
  size?: number;
}

/**
 * MetaMask Wallet SVG Icon
 * Official brand colors and simplified logo design
 */
export const MetaMaskIcon: React.FC<MetaMaskIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fox head - simplified MetaMask logo */}
      <path
        d="M27.5 4L18 11.5L19.8 7.2L27.5 4Z"
        fill="#E17726"
        stroke="#E17726"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 4L13.9 11.6L12.2 7.2L4.5 4Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.8 22.4L21 26.8L26.9 28.4L28.6 22.5L23.8 22.4Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.4 22.5L5.1 28.4L11 26.8L8.2 22.4L3.4 22.5Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.7 14.2L9.2 16.5L15 16.8L14.8 10.7L10.7 14.2Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.3 14.2L17.1 10.6L17 16.8L22.8 16.5L21.3 14.2Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 26.8L14.5 25.1L11.5 22.5L11 26.8Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 25.1L21 26.8L20.5 22.5L17.5 25.1Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 26.8L17.5 25.1L17.8 27.6L17.7 28.3L21 26.8Z"
        fill="#D5BFB2"
        stroke="#D5BFB2"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 26.8L14.3 28.3L14.2 27.6L14.5 25.1L11 26.8Z"
        fill="#D5BFB2"
        stroke="#D5BFB2"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.4 20.3L11.5 19.4L13.5 18.5L14.4 20.3Z"
        fill="#233447"
        stroke="#233447"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.6 20.3L18.5 18.5L20.5 19.4L17.6 20.3Z"
        fill="#233447"
        stroke="#233447"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 26.8L11.5 22.4L8.2 22.5L11 26.8Z"
        fill="#CC6228"
        stroke="#CC6228"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 22.4L21 26.8L23.8 22.5L20.5 22.4Z"
        fill="#CC6228"
        stroke="#CC6228"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.8 16.5L17 16.8L17.6 20.3L18.5 18.5L20.5 19.4L22.8 16.5Z"
        fill="#CC6228"
        stroke="#CC6228"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 19.4L13.5 18.5L14.4 20.3L15 16.8L9.2 16.5L11.5 19.4Z"
        fill="#CC6228"
        stroke="#CC6228"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 16.5L11.5 22.5L11.5 19.4L9.2 16.5Z"
        fill="#E27525"
        stroke="#E27525"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 19.4L20.5 22.5L22.8 16.5L20.5 19.4Z"
        fill="#E27525"
        stroke="#E27525"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 16.8L14.4 20.3L15.1 23.7L15.3 19.1L15 16.8Z"
        fill="#E27525"
        stroke="#E27525"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 16.8L16.7 19.1L16.9 23.7L17.6 20.3L17 16.8Z"
        fill="#E27525"
        stroke="#E27525"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.6 20.3L16.9 23.7L17.5 25.1L20.5 22.5L20.5 19.4L17.6 20.3Z"
        fill="#F5841F"
        stroke="#F5841F"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 19.4L11.5 22.5L14.5 25.1L15.1 23.7L14.4 20.3L11.5 19.4Z"
        fill="#F5841F"
        stroke="#F5841F"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.7 28.3L17.8 27.6L17.5 27.4H14.5L14.2 27.6L14.3 28.3L11 26.8L12.2 27.8L14.5 29.4H17.5L19.8 27.8L21 26.8L17.7 28.3Z"
        fill="#C0AC9D"
        stroke="#C0AC9D"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 25.1L16.9 23.7H15.1L14.5 25.1L14.2 27.6L14.5 27.4H17.5L17.8 27.6L17.5 25.1Z"
        fill="#161616"
        stroke="#161616"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27.9 12.2L28.9 7.4L27.5 4L17.5 11.4L21.3 14.2L26.7 15.8L28 14.3L27.4 13.9L28.3 13.1L27.6 12.6L28.5 11.9L27.9 12.2Z"
        fill="#763E1A"
        stroke="#763E1A"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.1 7.4L4.1 12.2L3.5 11.9L4.4 12.6L3.7 13.1L4.6 13.9L4 14.3L5.3 15.8L10.7 14.2L14.5 11.4L4.5 4L3.1 7.4Z"
        fill="#763E1A"
        stroke="#763E1A"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26.7 15.8L21.3 14.2L22.8 16.5L20.5 22.5L23.8 22.5H28.6L26.7 15.8Z"
        fill="#F5841F"
        stroke="#F5841F"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.7 14.2L5.3 15.8L3.4 22.5H8.2L11.5 22.5L9.2 16.5L10.7 14.2Z"
        fill="#F5841F"
        stroke="#F5841F"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 16.8L17.5 11.4L19.8 7.2H12.2L14.5 11.4L15 16.8L15.1 19.1L15.1 23.7H16.9L16.9 19.1L17 16.8Z"
        fill="#F5841F"
        stroke="#F5841F"
        strokeWidth="0.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MetaMaskIcon;
