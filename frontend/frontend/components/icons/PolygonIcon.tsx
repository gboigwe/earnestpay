import React from 'react';

interface PolygonIconProps {
  className?: string;
  size?: number;
}

/**
 * Polygon Network Icon
 * Official Polygon logo
 */
export const PolygonIcon: React.FC<PolygonIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M22 11.5C21.4 11.2 20.7 11.2 20.1 11.5L17 13.3L14.9 14.5L11.8 16.3C11.2 16.6 10.5 16.6 9.9 16.3L7.5 14.9C6.9 14.6 6.5 14 6.5 13.3V10.7C6.5 10 6.9 9.4 7.5 9.1L9.9 7.7C10.5 7.4 11.2 7.4 11.8 7.7L14.2 9.1C14.8 9.4 15.2 10 15.2 10.7V12.5L17.3 11.3V9.5C17.3 8.8 16.9 8.2 16.3 7.9L11.9 5.5C11.3 5.2 10.6 5.2 10 5.5L5.5 7.9C4.9 8.2 4.5 8.8 4.5 9.5V14.5C4.5 15.2 4.9 15.8 5.5 16.1L10 18.5C10.6 18.8 11.3 18.8 11.9 18.5L14.9 16.7L17 15.5L20 13.7C20.6 13.4 21.3 13.4 21.9 13.7L24.3 15.1C24.9 15.4 25.3 16 25.3 16.7V19.3C25.3 20 24.9 20.6 24.3 20.9L22 22.3C21.4 22.6 20.7 22.6 20.1 22.3L17.7 20.9C17.1 20.6 16.7 20 16.7 19.3V17.5L14.6 18.7V20.5C14.6 21.2 15 21.8 15.6 22.1L20.1 24.5C20.7 24.8 21.4 24.8 22 24.5L26.5 22.1C27.1 21.8 27.5 21.2 27.5 20.5V15.5C27.5 14.8 27.1 14.2 26.5 13.9L22 11.5Z"
        fill="#8247E5"
      />
    </svg>
  );
};

export default PolygonIcon;
