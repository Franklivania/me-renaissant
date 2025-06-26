import { useState, useEffect } from "react";
import { Button } from "@/components/button";
import { RadioOption } from "@/components/form/radio-option";
import { useProfileStore } from "@/store/useProfileStore";

interface GenderProps {
  onContinue?: () => void;
}

const options = [
  'Man',
  'Woman',
  'Something else or beyond',
  'Prefer not to say',
];

export default function Gender({ onContinue }: GenderProps) {
  const { onboardingData, updateOnboardingField } = useProfileStore();
  const [selectedGender, setSelectedGender] = useState<string>(onboardingData.gender || '');

  useEffect(() => {
    if (selectedGender) {
      updateOnboardingField('gender', selectedGender);
    }
  }, [selectedGender, updateOnboardingField]);

  const handleChange = (value: string) => {
    setSelectedGender(value);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGender && onContinue) {
      onContinue();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start">
      <h1 className="text-3xl">⚧ How dost thou identify thyself?</h1>

      <form className="w-full my-auto flex flex-col space-y-5" onSubmit={handleContinue}>
        <>
          <span className="font-im text-lg text-brown-100">3. Select thy gender — as thou wilt.</span>
          <small className="ml-auto text-brown-100 opacity-40">select one</small>
        </>

        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => (
            <RadioOption
              key={option}
              value={option}
              label={option}
              checked={selectedGender === option}
              onChange={handleChange}
            />
          ))}
        </section>

        <Button
          showQuill
          className="w-max ml-auto mt-3"
          type="submit"
          disabled={!selectedGender}
        >
          Continue
        </Button>
      </form>
    </div>
  )
}