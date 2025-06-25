import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import { Modal } from '@/components/modal';
import { Button } from '@/components';
import { useChatStore } from '@/store/useChatStore';
import { useNavigate } from 'react-router-dom';
import type { ConversationMessage } from '@/types';
import useDeviceSize from '@/hooks/useDeviceSize';
import clsx from 'clsx';

interface ChatActionsProps {
  conversationId: string;
  conversationTitle: string;
  messages?: ConversationMessage[];
  onActionComplete?: () => void;
}

export const ChatActions: React.FC<ChatActionsProps> = ({
  conversationId,
  conversationTitle,
  messages = [],
  onActionComplete
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { deleteConversation } = useChatStore();
  const navigate = useNavigate();
  const { isMobile } = useDeviceSize();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleExportChat = async () => {
    setIsExporting(true);

    try {
      // Create text content
      const chatContent = messages
        .map(msg => {
          const timestamp = new Date(msg.created_at).toLocaleString();
          const sender = msg.sender === 'user' ? 'You' : 'Renaissance Mirror';
          return `[${timestamp}] ${sender}: ${msg.message}`;
        })
        .join('\n\n');

      const fullContent = `Chat Export: ${conversationTitle}
Generated on: ${new Date().toLocaleString()}
Total Messages: ${messages.length}

${'='.repeat(50)}

${chatContent}

${'='.repeat(50)}

End of Chat Export`;

      // Create and download file
      const blob = new Blob([fullContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${conversationTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowActions(false);
      onActionComplete?.();
    } catch (error) {
      console.error('Error exporting chat:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteChat = async () => {
    setIsDeleting(true);

    try {
      const success = await deleteConversation(conversationId);

      if (success) {
        setShowDeleteModal(false);
        setShowActions(false);
        onActionComplete?.();

        // Navigate to main chat if we're currently viewing this conversation
        const currentUrl = window.location.href;
        if (currentUrl.includes(`chat=${conversationId}`)) {
          navigate('/chat');
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      {/* Actions Trigger */}
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          setShowActions(!showActions);
        }}
        className="p-1 rounded-md hover:bg-brown-100/10 text-brown-100/60 hover:text-brown-100 transition-colors"
      >
        <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
      </motion.button>

      {/* Actions Dropdown */}
      <AnimatePresence>
        {showActions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setShowActions(false)}
            />

            {/* Actions Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className={clsx(
                'absolute bg-brown-800 border border-brown-100/20 rounded-lg shadow-xl z-40 min-w-48',
                'right-0 top-8'
              )}
            >
              <div className="p-2 space-y-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportChat}
                  disabled={isExporting || messages.length === 0}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-brown-100/10 text-brown-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <Icon
                    icon={isExporting ? "lucide:loader-2" : "lucide:download"}
                    className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`}
                  />
                  <span className="text-sm">
                    {isExporting ? 'Exporting...' : 'Export Chat'}
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowActions(false);
                    setShowDeleteModal(true);
                  }}
                  disabled={conversationId === 'default'}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-red-400/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <Icon icon="lucide:trash-2" className="w-4 h-4" />
                  <span className="text-sm">Delete Chat</span>
                </motion.button>

                {conversationId === 'default' && (
                  <p className="text-xs text-brown-100/40 px-2 py-1">
                    Main conversation cannot be deleted
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        variant="small"
        title="Delete Chat"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-400/20 flex items-center justify-center">
              <Icon icon="lucide:alert-triangle" className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-brown-100 mb-2">
              Are you sure you want to delete this chat?
            </p>
            <p className="text-sm text-brown-100/60">
              "{conversationTitle}" will be permanently removed. This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDeleteChat}
              loading={isDeleting}
              disabled={isDeleting}
              className="flex-1 bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};