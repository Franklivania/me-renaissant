import React from 'react';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';
import { Icon } from "@iconify/react";
import { motion } from "motion/react";

const Spinner: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    className="animate-spin"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ display: 'inline-block' }}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Loading"
  >
    <circle
      className="opacity-20"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-80"
      fill="currentColor"
      d="M22 12a10 10 0 0 1-10 10v-4a6 6 0 0 0 6-6h4z"
    />
  </svg>
);

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-opacity-50',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          [
            'bg-brown-100 text-brown-800 border-2 border-brown-100',
            'hover:bg-gold hover:border-gold',
            'disabled:hover:bg-brown-100 disabled:hover:border-brown-100',
            'data-[loading=true]:hover:bg-brown-100 data-[loading=true]:hover:border-brown-100',
          ].join(' '),
        secondary:
          [
            'bg-transparent text-brown-100 border-2 border-brown-100',
            'hover:border-brown-100',
            'disabled:hover:border-brown-100',
            'data-[loading=true]:hover:border-brown-100',
          ].join(' '),
        ghost:
          [
            'bg-transparent text-renaissance-700',
            'hover:text-brown-800',
            'disabled:hover:text-renaissance-700',
            'data-[loading=true]:hover:text-renaissance-700',
          ].join(' '),
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
      },
      radius: {
        full: 'rounded-full',
        curved: 'rounded-lg',
        flat: 'rounded-none',
      },
      loading: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      radius: 'full',
      loading: false,
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  showQuill?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  radius,
  children,
  showQuill = false,
  loading = false,
  disabled,
  ...props
}) => {
  // If loading, always disable the button
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      className={clsx(
        buttonVariants({ variant, size, radius, loading }),
        className
      )}
      disabled={isDisabled}
      data-loading={loading ? 'true' : 'false'}
      {...props}
    >
      <span className="flex items-center gap-2">
        {children}
        {showQuill && !loading && <Icon icon="streamline-cyber:quill" width={24} height={24} />}
        {loading && (
          <span className="ml-2">
            <Spinner size={22} />
          </span>
        )}
      </span>
    </motion.button>
  );
};