import { Icon } from "@iconify/react/dist/iconify.js";
import { motion } from "motion/react";
import useDeviceSize from "@/hooks/useDeviceSize";
import useSidebarStore from "@/store/useSidebarStore";
import { useProfileStore } from "@/store/useProfileStore";

function generateInitials(name: string): string {
  if (!name) return 'FA';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    // Single word like "Charles" becomes "CS"
    const word = words[0];
    return word.length >= 2 ? (word[0] + word[1]).toUpperCase() : word[0].toUpperCase();
  } else {
    // Multiple words like "Frank Ortega" becomes "FO"
    return words.map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }
}

export default function Topnav() {
  const { isMobile } = useDeviceSize();
  const { toggleExpand } = useSidebarStore();
  const { profile, onboardingData } = useProfileStore();

  const userName = profile?.name || onboardingData.name || '';
  const userInitials = generateInitials(userName);

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

      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`rounded-full flex items-center justify-center text-xl bg-brown-300/60 font-semibold text-brown-100 ${
          isMobile ? 'w-8 h-8 text-lg' : 'w-10 h-10'
        }`}
        title={userName || 'User'}
      >
        {userInitials}
      </motion.div>
    </header>
  )
}