import useSidebarStore from "@/store/useSidebarStore"
import { useChatActionsStore } from "@/store/useChatActionsStore"
import type { ReactNode } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Icon } from "@iconify/react"
import { useState, useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useChatStore } from "@/store/useChatStore"
import { ChatActions } from "@/components/chat-actions"
import Image from "@/components/image"
import clsx from 'clsx'

const NavItem = ({ 
  children, 
  label, 
  expand, 
  onClick, 
  isActive = false, 
  conversationId, 
  showActions = false 
}: {
  children: ReactNode,
  label: string,
  expand: boolean,
  onClick?: () => void,
  isActive?: boolean,
  conversationId?: string,
  showActions?: boolean
}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const { activeDropdown, setActiveDropdown, closeDropdown } = useChatActionsStore()
  const { messages, loadConversationHistory } = useChatStore()
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const isDropdownOpen = activeDropdown === conversationId

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown()
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen, closeDropdown])

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDropdownOpen) {
      closeDropdown()
    } else {
      setActiveDropdown(conversationId!)
    }
  }

  return (
    <div className="relative group">
      <motion.div
        className={`flex items-center w-full rounded-xl p-3 transition-colors text-brown-100 text-left group ${
          isActive
            ? 'bg-brown-100/20 text-brown-100'
            : 'hover:bg-brown-100/10'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => {
          if (!expand) setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
        }}
      >
        <button
          type="button"
          onClick={onClick}
          className="flex flex-1 items-center min-w-0"
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
                className="ml-3 text-sm font-medium whitespace-nowrap truncate"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Actions Button - Integrated into NavItem */}
        {showActions && expand && conversationId && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDropdown}
            className="ml-2 p-1 rounded-md hover:bg-brown-100/10 text-brown-100/60 hover:text-brown-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
          </motion.button>
        )}
      </motion.div>

      {/* Actions Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && showActions && conversationId && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998]"
              onClick={closeDropdown}
            />

            {/* Dropdown Menu */}
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className={clsx(
                'absolute bg-brown-800 border border-brown-100/20 rounded-lg shadow-2xl min-w-48 z-[9999]',
                'right-0 top-full mt-1'
              )}
            >
              <div className="p-2 space-y-1">
                <ChatActions
                  conversationId={conversationId}
                  conversationTitle={label}
                  messages={messages}
                  onActionComplete={async () => {
                    closeDropdown()
                    // Force reload conversations after action
                    const { loadConversations } = useChatStore.getState()
                    await loadConversations()
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tooltip */}
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
  const { conversations, loadConversations, isConnected } = useChatStore();
  const { closeDropdown } = useChatActionsStore();

  useEffect(() => {
    if (isConnected) {
      loadConversations();
    }
  }, [loadConversations, isConnected]);

  // Close any open dropdowns when sidebar collapses
  useEffect(() => {
    if (!expand) {
      closeDropdown();
    }
  }, [expand, closeDropdown]);

  const handleNewChat = () => {
    const newChatId = crypto.randomUUID();
    navigate(`/chat?chat=${newChatId}`);
  };

  const handleConversationClick = (conversationId: string) => {
    closeDropdown(); // Close any open dropdown when navigating
    if (conversationId === 'default') {
      navigate("/chat");
    } else {
      navigate(`/chat?chat=${conversationId}`);
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
      <div className="w-full h-full flex flex-col gap-1">
        <NavItem
          label="Me RenAIssant"
          expand={expand}
          isActive={false}
        >
          <Image src="/favicon.ico" width={24} height={24} alt="Me RenAIssant" className="object-contain" />
        </NavItem>

        <NavItem
          label="New Chat"
          expand={expand}
          onClick={handleNewChat}
          isActive={false}
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

        {expand && conversations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 w-full h-full"
          >
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-brown-100/60 uppercase tracking-normal">
                Recent Conversations
              </h3>
            </div>
            <div className="h-full space-y-1 overflow-x-hidden overflow-y-auto flex-1 pr-1" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#D4AF37 #2A1F14'
            }}>
              {conversations.slice(0, 10).map((conversation) => (
                <NavItem
                  key={conversation.id}
                  label={conversation.title}
                  expand={expand}
                  onClick={() => handleConversationClick(conversation.id)}
                  isActive={currentChat === conversation.id}
                  conversationId={conversation.id}
                  showActions={conversation.id !== 'default'}
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