import { Button } from "@/components";
import { Input } from "@/components/form/input";
import { useProfileStore } from "@/store/useProfileStore";
import { useState } from "react";

interface IntroductionProps {
  onContinue?: () => void;
}

export default function Introduction({ onContinue }: IntroductionProps) {
  const { onboardingData, updateOnboardingField } = useProfileStore();
  const [name, setName] = useState(onboardingData.name || '');

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      updateOnboardingField('name', name.trim());
      onContinue?.();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start">
      <h1 className="text-3xl">✨ Welcome, traveller of tangled timelines.</h1>

      <form className="w-full my-auto flex flex-col" onSubmit={handleContinue}>
        <Input
          label="1. What shall we call thee?"
          placeholder="Thy name or whatever, dearest..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Button
          showQuill
          className="w-max ml-auto mt-3"
          type="submit"
          disabled={!name.trim()}
        >
          Continue
        </Button>
      </form>
    </div>
  )
}