import useSidebarStore from "@/store/useSidebarStore"
import { useChatActionsStore } from "@/store/useChatActionsStore"
import type { ReactNode } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Icon } from "@iconify/react"
import Image from "@/components/image"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useChatStore } from "@/store/useChatStore"
import { useRef } from "react"
import { ChatActions } from "@/components/chat-actions"
import clsx from 'clsx'

interface MobileNavItemProps {
  children: ReactNode
  label: string
  onClick?: () => void
  delay?: number
  isActive?: boolean
  conversationId?: string
  showActions?: boolean
}

const MobileNavItem = ({ 
  children, 
  label, 
  onClick, 
  delay = 0, 
  isActive = false,
  conversationId,
  showActions = false
}: MobileNavItemProps) => {
  const { activeDropdown, setActiveDropdown, closeDropdown } = useChatActionsStore()
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const isDropdownOpen = activeDropdown === conversationId

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDropdownOpen) {
      closeDropdown()
    } else {
      setActiveDropdown(conversationId!)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="relative"
    >
      <div
        className={clsx(
          "flex items-center w-full rounded-xl p-4 text-brown-100",
          isActive ? 'bg-brown-100/20' : 'hover:bg-brown-100/10'
        )}
      >
        <button
          onClick={onClick}
          className="flex items-center flex-1 min-w-0"
        >
          <span className="flex-shrink-0 text-xl mr-4">
            {children}
          </span>
          <span className="text-base font-medium truncate">{label}</span>
        </button>

        {showActions && conversationId && (
          <button
            onClick={toggleDropdown}
            className="ml-2 p-2 rounded-lg hover:bg-brown-100/20 text-brown-100/80"
          >
            <Icon 
              icon={isDropdownOpen ? "lucide:x" : "lucide:more-vertical"} 
              className="w-5 h-5" 
            />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isDropdownOpen && showActions && conversationId && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute right-2 top-full mt-2 bg-brown-800/95 border border-brown-100/30 rounded-2xl min-w-48 z-[9999]"
          >
            <div className="p-3">
              <ChatActions
                conversationId={conversationId}
                conversationTitle={label}
                onActionComplete={closeDropdown}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function MobileSidebar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentChat = searchParams.get('chat')
  const { expand, setExpand } = useSidebarStore()
  const { conversations } = useChatStore()
  const { closeDropdown } = useChatActionsStore()

  const closeSidebar = () => {
    setExpand(false)
    closeDropdown()
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    closeSidebar()
  }

  const handleNewChat = () => {
    const newChatId = crypto.randomUUID()
    handleNavigation(`/chat?chat=${newChatId}`)
  }

  const handleConversationClick = (conversationId: string) => {
    closeDropdown()
    handleNavigation(conversationId === 'default' ? "/chat" : `/chat?chat=${conversationId}`)
  }

  return (
    <AnimatePresence>
      {expand && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-brown-100/10 z-40"
            onClick={closeSidebar}
          />

          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 w-[85vw] max-w-sm h-full bg-brown-800 border-r border-brown-100/30 flex flex-col z-50"
          >
            <div className="flex items-center justify-between p-6 border-b border-brown-100/20">
              <div className="flex items-center gap-3">
                <Image src="/favicon.ico" width={32} height={32} alt="Me RenAIssant" />
                <div>
                  <h2 className="text-brown-100 font-semibold text-lg">Me RenAIssant</h2>
                  <p className="text-brown-100/60 text-xs">
                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-xl hover:bg-brown-100/10 text-brown-100/80"
              >
                <Icon icon="lucide:x" className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-2 overflow-y-auto">
              <MobileNavItem 
                label="New Chat" 
                delay={0.15}
                onClick={handleNewChat}
              >
                <Icon icon="mdi:plus" className="w-6 h-6" />
              </MobileNavItem>
              
              <MobileNavItem 
                label="Joust Centre" 
                delay={0.2}
                onClick={() => handleNavigation("/chat/games")}
              >
                <Icon icon="ri:chess-fill" className="w-6 h-6" />
              </MobileNavItem>

              {conversations.length > 0 && (
                <div className="mt-6">
                  <div className="px-4 mb-3">
                    <h3 className="text-xs font-semibold text-brown-100/60 uppercase">
                      Recent Conversations
                    </h3>
                  </div>
                  
                  <div className="space-y-1">
                    {conversations.slice(0, 8).map((conversation, index) => (
                      <MobileNavItem
                        key={conversation.id}
                        label={conversation.title}
                        delay={0.3 + index * 0.05}
                        onClick={() => handleConversationClick(conversation.id)}
                        isActive={currentChat === conversation.id}
                        conversationId={conversation.id}
                        showActions={conversation.id !== 'default'}
                      >
                        <Icon icon="mdi:chat-outline" className="w-5 h-5" />
                      </MobileNavItem>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}