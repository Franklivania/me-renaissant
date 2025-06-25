import useSidebarStore from "@/store/useSidebarStore"
import type { ReactNode } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Icon } from "@iconify/react"
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useChatStore } from "@/store/useChatStore"

const NavItem = ({ children, label, expand, onClick, isActive = false, onDelete }: {
  children: ReactNode,
  label: string,
  expand: boolean,
  onClick?: () => void,
  isActive?: boolean,
  onDelete?: () => void
}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [showDeleteButton, setShowDeleteButton] = useState(false)

  return (
    <div className="relative group">
      <motion.button
        type="button"
        onClick={onClick}
        className={`flex items-center w-full rounded-xl p-3 transition-colors text-brown-100 text-left group ${
          isActive 
            ? 'bg-brown-100/20 text-brown-100' 
            : 'hover:bg-brown-100/10'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => {
          if (!expand) setShowTooltip(true);
          if (onDelete) setShowDeleteButton(true);
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
          setShowDeleteButton(false);
        }}
      >
        <motion.span
          className="flex-shrink-0 text-lg"
          animate={{ rotate: expand ? 0 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>

        <AnimatePresence>
          {expand && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="ml-3 text-sm font-medium whitespace-nowrap truncate flex-1"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Delete button for conversations */}
        {onDelete && expand && showDeleteButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="ml-2 p-1 rounded-md hover:bg-red-400/20 text-red-400 hover:text-red-300 transition-colors"
          >
            <Icon icon="mdi:delete-outline" className="w-4 h-4" />
          </motion.button>
        )}
      </motion.button>

      <AnimatePresence>
        {showTooltip && !expand && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full ml-5 top-1/2 -translate-y-1/2 z-50 px-3 py-0.5 bg-brown-100 rounded-sm shadow-lg whitespace-nowrap text-sm text-brown-800 pointer-events-none font-lato"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DesktopSidebar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentChat = searchParams.get('chat');
  const { expand, toggleExpand } = useSidebarStore();
  const { conversations, loadConversations, deleteConversation, isConnected } = useChatStore();

  useEffect(() => {
    if (isConnected) {
      loadConversations();
    }
  }, [loadConversations, isConnected]);

  const handleNewChat = () => {
    navigate("/chat");
  };

  const handleConversationClick = (conversationId: string) => {
    if (conversationId === 'default') {
      navigate("/chat");
    } else {
      navigate(`/chat?chat=${conversationId}`);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversation(conversationId);
    if (currentChat === conversationId) {
      navigate("/chat");
    }
  };

  return (
    <motion.menu
      className="bg-brown-900 border-r border-brown-100/20 flex flex-col p-2 overflow-visible relative"
      animate={{ width: expand ? 300 : 64 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      <div className="flex flex-col gap-1">
        <NavItem
          label="New Chat" 
          expand={expand}
          onClick={handleNewChat}
          isActive={!currentChat}
        >
          <Icon icon="mdi:plus" className="w-5 h-5" />
        </NavItem>

        <NavItem
          label="Joust Centre" 
          expand={expand}
          onClick={() => navigate("/chat/games")}
        >
          <Icon icon="ri:chess-fill" className="w-5 h-5" />
        </NavItem>

        {/* Conversations Section */}
        {expand && conversations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-brown-100/60 uppercase tracking-wider">
                Recent Conversations
              </h3>
            </div>
            <div className="space-y-1 max-h-64 overflow-x-hidden">
              {conversations.slice(0, 10).map((conversation) => (
                <NavItem
                  key={conversation.id}
                  label={conversation.title}
                  expand={expand}
                  onClick={() => handleConversationClick(conversation.id)}
                  isActive={currentChat === conversation.id}
                  onDelete={conversation.id !== 'default' ? () => handleDeleteConversation(conversation.id) : undefined}
                >
                  <Icon icon="mdi:chat-outline" className="w-4 h-4" />
                </NavItem>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-auto">
        <NavItem
          label={expand ? "Collapse" : "Expand"}
          expand={expand}
          onClick={toggleExpand}
        >
          <motion.div
            animate={{ rotate: expand ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Icon icon="lucide:sidebar" className="w-5 h-5" />
          </motion.div>
        </NavItem>
      </div>
    </motion.menu>
  )
}