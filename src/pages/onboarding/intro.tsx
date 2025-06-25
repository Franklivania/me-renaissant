import { Button } from "@/components";
import { Input } from "@/components/form/input";

interface IntroductionProps {
  onContinue?: () => void;
}

export default function Introduction({ onContinue }: IntroductionProps) {
  return (
    <div className="w-full h-full flex flex-col items-start">
      <h1 className="text-3xl">✨ Welcome, traveller of tangled timelines.</h1>

      <form className="w-full my-auto flex flex-col">
        <Input
          label="1. What shall we call thee?"
          placeholder="Thy name or whatever, dearest..."
        />

        <Button
          showQuill
          className="w-max ml-auto mt-3"
          onClick={onContinue}
        >
          Continue
        </Button>
      </form>
    </div>
  )
}
