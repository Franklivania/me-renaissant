import useSidebarStore from "@/store/useSidebarStore"
import type { ReactNode } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Icon } from "@iconify/react"
import Image from "@/components/image"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const NavItem = ({ children, label, expand, onClick }: {
  children: ReactNode,
  label: string,
  expand: boolean,
  onClick?: () => void
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={onClick}
        className="flex items-center w-full rounded-xl p-3 hover:bg-brown-100/10 transition-colors text-brown-100 text-left group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => !expand && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
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
              className="ml-3 text-sm font-medium whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
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
  const { expand, toggleExpand } = useSidebarStore()

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
          label="Me RenAIssant" expand={expand}
          onClick={() => navigate("/chat")}
        >
          <Image src="/favicon.ico" width={24} height={24} alt="Me RenAIssant" />
        </NavItem>

        <NavItem
          label="Joust Centre" expand={expand}
          onClick={() => navigate("/chat/games")}
        >
          <Icon icon="ri:chess-fill" className="w-5 h-5" />
        </NavItem>

        <NavItem label="Play Music" expand={expand}>
          <Icon icon="weui:music-filled" className="w-5 h-5" />
        </NavItem>
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