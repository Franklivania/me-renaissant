import { Button } from "@/components";
import useDeviceSize from "@/hooks/useDeviceSize";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

export default function RevealPage() {
  const navigate = useNavigate();
  const { isMobile } = useDeviceSize();

  return (
    <div className="w-full h-screen overflow-x-hidden bg-brown-800 flex">
      <main className="w-full max-w-2xl h-full mx-auto text-brown-100 py-8 px-4 space-y-12" role="presentation">
        <h1 className="text-xl md:text-3xl">
          🕯️ The mirror clears... a figure takes shape. There thou art, staring back through time.
        </h1>

        <section className="w-full flex flex-col gap-12">
          <div>
            <h1>Niccolò d’Amaranta</h1>
            <p className="text-xl italic font-im opacity-60">Ballad-Scribe of the Lost Winds</p>
          </div>

          <blockquote
            className="
              relative w-full lg:max-w-3/4 h-fit bg-brown-100/10 p-4 rounded-lg lg:ml-5
              before:absolute before:top-0 before:-left-5 before:w-1 before:h-full before:bg-brown-100 before:rounded-lg
            "
          >
            Born under a moon that refused to set, Niccolò sings songs no one claims to
            have written — yet all recall in dreams. His home is the hush between two trees.
            His words curl like smoke from cold tea. Once, he convinced a dying prince to laugh.
            Once, he made an owl cry. People do not remember his face, but they always recall
            their favourite line.
          </blockquote>

          <p className="text-lg font-im">
            Drawn from the same fire as thee, yet forged in ink, lutes, and larder-smoke.
            A kindred stranger. A whispering echo. Thy mirrored self, not reborn — merely
            revealed.
          </p>

          <h3>
            Their voice awaits. <br />
            Shall it speak aloud, or stay silent like old parchment?
          </h3>

          <div className="w-full flex flex-col md:flex-row items-center gap-4 mb-10">
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
          </div>
        </section>
      </main>
    </div>
  );
}
