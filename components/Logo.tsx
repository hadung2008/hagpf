
import React, { useState } from 'react';
import { LogoIcon } from './icons';

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({ className, alt = "Logo" }) => {
  const [error, setError] = useState(false);

  if (error) {
    // Fallback to SVG icon if image fails to load
    // Applies default brand color styling
    return <LogoIcon className={`${className} text-indigo-600 dark:text-indigo-400`} />;
  }

  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`${className} object-contain`}
      onError={() => setError(true)}
    />
  );
};
