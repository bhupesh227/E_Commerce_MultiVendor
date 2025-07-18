import React from 'react';

const Logo = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    width={200}
    height={40}
    shapeRendering="geometricPrecision"
    textRendering="geometricPrecision"
    imageRendering="auto"
    fillRule="evenodd"
    clipRule="evenodd"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 1200 200"
    {...props}
  >
    <defs>
      <style>
        {`
          .orange-text { fill: #fe7c00; }
          .blue-text { fill: #2563eb; }
          .logo-text { font-family: 'Arial', sans-serif; font-weight: bold; }
        `}
      </style>
    </defs>
    
    {/* Letter "e" in orange */}
    <text 
      x="50" 
      y="140" 
      className="orange-text logo-text" 
      fontSize="120"
      fontWeight="bold"
    >
      e
    </text>
    
    {/* "Comm" in blue */}
    <text 
      x="150" 
      y="140" 
      className="blue-text logo-text" 
      fontSize="120"
      fontWeight="bold"
    >
      Comm
    </text>
    
    {/* Shopping bag icon in orange (similar to original design) */}
    <g transform="translate(600, 20)">
      <rect
        x="10"
        y="40"
        width="120"
        height="120"
        rx="8"
        ry="8"
        fill="none"
        stroke="#fe7c00"
        strokeWidth="8"
      />
      <path
        d="M40 40 L40 20 Q40 10 50 10 L90 10 Q100 10 100 20 L100 40"
        fill="none"
        stroke="#fe7c00"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

export default Logo;
