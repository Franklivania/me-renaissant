import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  className,
  label,
  error,
  ...props
}) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-lg font-medium text-brown-100 font-im mb-2">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-3 text-lg bg-black/5 border-b-2 border-brown-100 text-brown-100 placeholder-brown-100/10 focus:outline-none focus:border-gold placeholder:font-im transition-colors duration-200',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};