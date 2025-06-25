import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { Icon } from '@iconify/react';
import useDeviceSize from '@/hooks/useDeviceSize';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  variant?: 'base' | 'small' | 'medium' | 'sidemodal';
  sidePosition?: 'left' | 'right';
  width?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  variant = 'base',
  sidePosition = 'right',
  width,
  showCloseButton = true,
  closeOnOverlayClick = true,
  className
}) => {
  const { isMobile } = useDeviceSize();

  const getModalClasses = () => {
    if (isMobile) {
      return 'w-[96vw] h-[95vh] max-w-none max-h-none';
    }

    switch (variant) {
      case 'small':
        return 'w-80 min-h-fit max-h-80 max-w-sm';
      case 'medium':
        return 'w-[60vw] h-[70vh] max-w-2xl max-h-[70vh]';
      case 'sidemodal':
        return `${width || 'w-[35vw]'} h-screen max-w-none max-h-none ${
          sidePosition === 'left' ? 'ml-0 mr-auto' : 'ml-auto mr-0'
        }`;
      case 'base':
      default:
        return 'w-[35vw] h-[80vh] max-w-lg max-h-[80vh]';
    }
  };

  const getModalPosition = () => {
    if (variant === 'sidemodal') {
      return sidePosition === 'left' 
        ? 'justify-start items-center' 
        : 'justify-end items-center';
    }
    return 'justify-center items-center';
  };

  const getModalAnimation = () => {
    if (variant === 'sidemodal') {
      return {
        initial: { 
          x: sidePosition === 'left' ? '-100%' : '100%',
          opacity: 0 
        },
        animate: { x: 0, opacity: 1 },
        exit: { 
          x: sidePosition === 'left' ? '-100%' : '100%',
          opacity: 0 
        }
      };
    }
    
    if (variant === 'small') {
      return {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 }
      };
    }

    return {
      initial: { scale: 0.95, opacity: 0, y: 20 },
      animate: { scale: 1, opacity: 1, y: 0 },
      exit: { scale: 0.95, opacity: 0, y: 20 }
    };
  };

  const isScrollable = variant !== 'small';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={clsx(
            'fixed inset-0 z-50 flex',
            getModalPosition()
          )}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            {...getModalAnimation()}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              mass: 0.8
            }}
            className={clsx(
              'relative bg-brown-800 border border-brown-100/20 shadow-2xl flex flex-col',
              variant === 'sidemodal' ? 'rounded-none' : 'rounded-lg',
              getModalClasses(),
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4">
                {title && (
                  <h3 className="text-lg font-semibold text-brown-100 font-im">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-brown-100/10 text-brown-100/60 hover:text-brown-100 transition-colors"
                  >
                    <Icon icon="lucide:x" className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={clsx(
              'p-4',
              isScrollable && 'overflow-y-auto flex-1',
              variant === 'small' && 'flex-shrink-0'
            )}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};