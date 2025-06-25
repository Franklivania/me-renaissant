import React from 'react';
import { clsx } from 'clsx';
import { motion } from "motion/react";

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
  fallbackSrc?: string;
  showLoadingState?: boolean;
}

export default function Image({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  onClick,
  fallbackSrc,
  showLoadingState = true,
}: ImageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(src);

  React.useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  const imageClasses = clsx(
    'transition-opacity duration-300',
    {
      'opacity-0': isLoading,
      'opacity-100': !isLoading && !hasError,
      'cursor-pointer': onClick,
    },
    className
  );

  if (hasError) {
    return (
      <div 
        className={clsx(
          'flex items-center justify-center bg-gray-100 text-gray-500',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {showLoadingState && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full"
          />
        </div>
      )}
      
      <motion.img
        src={currentSrc}
        alt={alt}
        title={alt}
        aria-label={alt}
        aria-labelledby={alt}
        width={width}
        height={height}
        loading={loading}
        className={imageClasses}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        whileHover={onClick ? { scale: 1.02 } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
      />
    </div>
  );
}
