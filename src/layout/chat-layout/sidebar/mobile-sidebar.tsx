import useSidebarStore from "@/store/useSidebarStore"
import type { ReactNode } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Icon } from "@iconify/react"
import Image from "@/components/image"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useChatStore } from "@/store/useChatStore"
import { useEffect } from "react"

interface MobileNavItemProps {
  children: ReactNode
  label: string
  onClick?: () => void
  delay?: number
  isActive?: boolean
}

const MobileNavItem = ({ children, label, onClick, delay = 0, isActive = false }: MobileNavItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay, 
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      <motion.button
        type="button"
        onClick={onClick}
        className={`flex items-center w-full rounded-xl p-4 transition-all text-brown-100 text-left group touch-manipulation ${
          isActive 
            ? 'bg-brown-100/20 text-brown-100' 
            : 'hover:bg-brown-100/10 active:bg-brown-100/20'
        }`}
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.span 
          className="flex-shrink-0 text-xl mr-4"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
        
        <span className="text-base font-medium truncate">{label}</span>
        
        <motion.div
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <Icon icon="lucide:chevron-right" className="w-5 h-5 text-brown-100/60" />
        </motion.div>
      </motion.button>
    </motion.div>
  )
}

export default function MobileSidebar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentChat = searchParams.get('chat');
  const { expand, setExpand } = useSidebarStore();
  const { conversations, loadConversations } = useChatStore();

  useEffect(() => {
    if (expand) {
      loadConversations();
    }
  }, [expand, loadConversations]);

  const closeSidebar = () => setExpand(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  const handleConversationClick = (conversationId: string) => {
    if (conversationId === 'default') {
      handleNavigation("/chat");
    } else {
      handleNavigation(`/chat?chat=${conversationId}`);
    }
  };

  return (
    <>
      <AnimatePresence>
        {expand && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 bg-brown-100/10 backdrop-blur-sm z-40"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expand && (
          <motion.nav
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ 
              type: "spring",
              damping: 30,
              stiffness: 150,
              mass: 0.8,
              opacity: { duration: 0.2 }
            }}
            className="fixed top-0 left-0 w-[80vw] max-w-sm h-full bg-brown-800/95 backdrop-blur-xl border-r border-brown-100/30 flex flex-col z-50 shadow-2xl overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex items-center justify-between p-6 border-b border-brown-100/20"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Image src="/favicon.ico" width={32} height={32} alt="Me RenAIssant" />
                </motion.div>
                <div>
                  <h2 className="text-brown-100 font-semibold text-lg">Me RenAIssant</h2>
                </div>
              </div>
              
              <motion.button
                type="button"
                onClick={closeSidebar}
                className="p-2 rounded-xl hover:bg-brown-100/10 active:bg-brown-100/20 transition-colors text-brown-100/80 hover:text-brown-100"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close menu"
              >
                <Icon icon="lucide:x" className="w-6 h-6" />
              </motion.button>
            </motion.div>

            <div className="flex-1 p-6 space-y-2">
              <MobileNavItem 
                label="New Chat" 
                delay={0.15}
                onClick={() => handleNavigation("/chat")}
                isActive={!currentChat}
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

              {/* Conversations */}
              {conversations.length > 0 && (
                <div className="mt-6">
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-xs font-semibold text-brown-100/60 uppercase tracking-wider px-4 mb-3"
                  >
                    Recent Conversations
                  </motion.h3>
                  {conversations.slice(0, 8).map((conversation, index) => (
                    <MobileNavItem
                      key={conversation.id}
                      label={conversation.title}
                      delay={0.3 + index * 0.05}
                      onClick={() => handleConversationClick(conversation.id)}
                      isActive={currentChat === conversation.id}
                    >
                      <Icon icon="mdi:chat-outline" className="w-5 h-5" />
                    </MobileNavItem>
                  ))}
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}