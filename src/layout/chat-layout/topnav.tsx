import { Icon } from "@iconify/react/dist/iconify.js";
import { motion } from "motion/react";
import useDeviceSize from "@/hooks/useDeviceSize";
import useSidebarStore from "@/store/useSidebarStore";

export default function Topnav() {
  const { isMobile } = useDeviceSize();
  const { toggleExpand } = useSidebarStore();

  return (
    <header className="px-4 md:px-6 py-3 flex items-center gap-6">
      {isMobile && (
        <motion.button
          type="button"
          onClick={toggleExpand}
          className="p-2 rounded-lg hover:bg-brown-100/10 transition-colors text-brown-100 mr-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle menu"
        >
          <Icon icon="lucide:menu" className="w-5 h-5" />
        </motion.button>
      )}

      <button
        type="button"
        className={`flex items-center gap-3 bg-brown-300/20 px-4 py-1.5 rounded-md opacity-40 hover:opacity-100 transition-all ease-in-out ${
          isMobile ? 'text-sm px-3 py-1' : ''
        } ml-auto`}
      >
        <span className={isMobile ? 'hidden sm:inline' : ''}>Star on GitHub</span>
        <span className={isMobile ? 'sm:hidden' : 'hidden'}>Star</span>
        <Icon icon="uil:github" width={18} height={18} />
      </button>

      <span className={`rounded-full flex items-center justify-center text-xl bg-brown-300/60 ${
        isMobile ? 'w-8 h-8 text-lg' : 'w-10 h-10'
      }`}>
        FA
      </span>
    </header>
  )
}