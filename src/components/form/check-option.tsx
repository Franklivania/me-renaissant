import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { Icon } from '@iconify/react';

interface CheckOptionProps {
  value: string;
  label: string;
  checked: boolean;
  onChange: (value: string) => void;
  className?: string;
}

export const CheckOption: React.FC<CheckOptionProps> = ({
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
          'w-6 h-6 flex items-center justify-center transition-all duration-200',
          checked ? 'text-brown-100' : 'text-brown-100/60'
        )}>
          {checked ? (
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Icon 
                icon="material-symbols-light:check-box" 
                className="w-6 h-6"
              />
            </motion.div>
          ) : (
            <Icon 
              icon="carbon:checkbox" 
              className="w-6 h-6"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};