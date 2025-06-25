import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface RadioOptionProps {
  value: string;
  label: string;
  checked: boolean;
  onChange: (value: string) => void;
  className?: string;
}

export const RadioOption: React.FC<RadioOptionProps> = ({
  value,
  label,
  checked,
  onChange,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'relative cursor-pointer',
        className
      )}
      onClick={() => onChange(value)}
    >
      <div className={clsx(
        'flex items-center justify-between px-6 py-4 rounded-full border-2 transition-all duration-200',
        checked 
          ? 'bg-brown-100/5 bg-opacity-10 border-brown-100 text-brown-100' 
          : 'bg-transparent border-brown-100/60 text-brown-100'
      )}>
        <span className="font-medium">{label}</span>
        <div className={clsx(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center',
          checked ? 'border-brown-100' : 'border-brown-100/60'
        )}>
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3 rounded-full bg-brown-100"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};