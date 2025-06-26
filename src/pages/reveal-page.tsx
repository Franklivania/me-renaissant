import { Button } from "@/components/button";
import useDeviceSize from "@/hooks/useDeviceSize";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "@/store/useProfileStore";
import { useEffect } from "react";
import { motion } from "motion/react";

export default function RevealPage() {
  const navigate = useNavigate();
  const { isMobile } = useDeviceSize();
  const { doppelganger, isLoading, loadProfile } = useProfileStore();

  useEffect(() => {
    // Load profile if not already loaded
    if (!doppelganger && !isLoading) {
      loadProfile();
    }
  }, [doppelganger, isLoading, loadProfile]);

  if (isLoading) {
    return (
      <div className="w-full h-screen overflow-x-hidden bg-brown-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brown-100/20 border-t-brown-100 rounded-full"
        />
      </div>
    );
  }

  if (!doppelganger) {
    return (
      <div className="w-full h-screen overflow-x-hidden bg-brown-800 flex items-center justify-center">
        <div className="text-center text-brown-100">
          <p className="mb-4">Something went amiss in the creation of thy doppelganger...</p>
          <Button onClick={() => navigate('/onboarding')}>
            Return to the Beginning
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-x-hidden bg-brown-800 flex">
      <main className="w-full max-w-2xl h-full mx-auto text-brown-100 py-8 px-4 space-y-12" role="presentation">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl md:text-3xl"
        >
          🕯️ The mirror clears... a figure takes shape. There thou art, staring back through time.
        </motion.h1>

        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full flex flex-col gap-12"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {doppelganger.name}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl italic font-im opacity-60"
            >
              {doppelganger.title}
            </motion.p>
          </div>

          <motion.blockquote
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="
              relative w-full lg:max-w-3/4 h-fit bg-brown-100/10 p-4 rounded-lg lg:ml-5
              before:absolute before:top-0 before:-left-5 before:w-1 before:h-full before:bg-brown-100 before:rounded-lg
            "
          >
            {doppelganger.description}
          </motion.blockquote>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="text-lg font-im"
          >
            Drawn from the same fire as thee, yet forged in ink, lutes, and larder-smoke.
            A kindred stranger. A whispering echo. Thy mirrored self, not reborn — merely
            revealed.
          </motion.p>

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            Their voice awaits. <br />
            Shall it speak aloud, or stay silent like old parchment?
          </motion.h3>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="w-full flex flex-col md:flex-row items-center gap-4 mb-10"
          >
            <Button
              className="gap-4 w-full"
              size={isMobile ? "sm" : "md"}
              onClick={() => navigate("/chat")}
            >
              Converse with thyself
              <Icon icon="guidance:chat" width={24} height={24} />
            </Button>
            <Button
              variant="secondary"
              className="gap-4 w-full"
              size={isMobile ? "sm" : "md"}
              onClick={() => navigate("/chat/games")}
            >
              Challenge thyself in jousts
              <Icon icon="ri:chess-fill" width={24} height={24} />
            </Button>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}