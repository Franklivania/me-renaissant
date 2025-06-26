import { Button } from "@/components/button";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/onboarding");
  };

  return (
    <div className="relative w-full h-screen max-w-[120em] mx-auto overflow-hidden bg-[url('/images/ren-bg.png')] bg-no-repeat bg-cover">
      <div className="absolute top-0 left-0 w-full h-full px-4 lg:px-0 bg-brown-300/30 flex flex-col items-center justify-center gap-6 z-10 text-brown-100">
        <h1 className="text-5xl lg:text-8xl">Me RenAIssant</h1>

        <span className="w-full max-w-xl text-center lg:text-xl">
          <p>
            Meet your Renaissance self — a poetic reflection shaped by your life, tastes, quirks, and contradictions.
          </p>
          <p>
            They live in scrolls, speak in riddles, and play games that span centuries.
          </p>
        </span>

        <Button
          showQuill
          size="lg"
          onClick={handleNavigate}
        >
          Begin
        </Button>
      </div>
    </div>
  )
}
