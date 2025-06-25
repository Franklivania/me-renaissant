import { Button } from "@/components";
import { Input } from "@/components/form/input";

interface RandomQuestionProps {
  onContinue?: () => void;
}

export default function RandomQuestion({ onContinue }: RandomQuestionProps) {
  return (
    <div className="w-full h-full flex flex-col items-start">
      <h1 className="text-3xl">🎲 A final question for thee, brave soul...</h1>

      <form className="w-full my-auto flex flex-col">
        <Input
          label="7. If thou couldst have any magical power, what would it be?"
          placeholder="Flight, invisibility, time travel, or other enchantment..."
        />

        <Button
          showQuill
          className="w-max ml-auto mt-3"
          onClick={onContinue}
        >
          Complete Journey
        </Button>
      </form>
    </div>
  )
}
