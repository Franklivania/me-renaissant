import { Button } from "@/components";
import { Input } from "@/components/form/input";
import { useProfileStore } from "@/store/useProfileStore";
import { useState } from "react";

interface RandomQuestionProps {
  onContinue?: () => void;
}

export default function RandomQuestion({ onContinue }: RandomQuestionProps) {
  const { onboardingData, updateOnboardingField, completeOnboarding, isLoading } = useProfileStore();
  const [soulQuestion, setSoulQuestion] = useState(onboardingData.soulQuestion || '');

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (soulQuestion.trim()) {
      updateOnboardingField('soulQuestion', soulQuestion.trim());
    }
    
    await completeOnboarding();
    onContinue?.();
  };

  return (
    <div className="w-full h-full flex flex-col items-start">
      <h1 className="text-3xl">🎲 A final question for thee, brave soul...</h1>

      <form className="w-full my-auto flex flex-col" onSubmit={handleComplete}>
        <Input
          label="7. If thou couldst have any magical power, what would it be?"
          placeholder="Flight, invisibility, time travel, or other enchantment..."
          value={soulQuestion}
          onChange={(e) => setSoulQuestion(e.target.value)}
        />

        <Button
          showQuill
          className="w-max ml-auto mt-3"
          type="submit"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Forging thy doppelganger...' : 'Complete Journey'}
        </Button>
      </form>
    </div>
  )
}