import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const AulaClaraLogo: React.FC<LogoProps> = ({ className = "w-10 h-10", size }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={size ? { width: size, height: size } : undefined}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Sun Rays */}
        <line x1="100" y1="20" x2="100" y2="45" stroke="#F97316" strokeWidth="12" strokeLinecap="round" />
        <line x1="50" y1="40" x2="68" y2="58" stroke="#F97316" strokeWidth="12" strokeLinecap="round" />
        <line x1="150" y1="40" x2="132" y2="58" stroke="#F97316" strokeWidth="12" strokeLinecap="round" />
        <line x1="25" y1="80" x2="50" y2="85" stroke="#F97316" strokeWidth="12" strokeLinecap="round" />
        <line x1="175" y1="80" x2="150" y2="85" stroke="#F97316" strokeWidth="12" strokeLinecap="round" />

        {/* Rising Sun Disk */}
        <circle cx="100" cy="85" r="28" fill="#F97316" />

        {/* Open Book Structure */}
        {/* Left Outer Cover */}
        <path
          d="M 25 95 C 25 95 65 90 92 110 L 92 180 C 65 160 25 165 25 165 Z"
          fill="#1E40AF"
        />
        {/* Right Outer Cover */}
        <path
          d="M 175 95 C 175 95 135 90 108 110 L 108 180 C 135 160 175 165 175 165 Z"
          fill="#1E40AF"
        />

        {/* Inner Pages (White Spine gap) */}
        <path
          d="M 32 102 C 32 102 65 98 90 115 L 90 172 C 65 156 32 160 32 160 Z"
          fill="#2563EB"
        />
        <path
          d="M 168 102 C 168 102 135 98 110 115 L 110 172 C 135 156 168 160 168 160 Z"
          fill="#2563EB"
        />

        {/* White Stylized 'A' / Center V-fold */}
        <path
          d="M 100 100 L 135 165 L 118 165 L 100 128 L 82 165 L 65 165 Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
};
