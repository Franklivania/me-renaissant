import { useState, useEffect } from "react";
import { Button } from "@/components";
import { RadioOption } from "@/components/form/radio-option";
import { useProfileStore } from "@/store/useProfileStore";

interface PreferredDrinkProps {
  onContinue?: () => void;
}

const options = [
  'Wine, red as sunset',
  'Coffee, dark as midnight',
  'Tea, gentle as morning mist',
  'Water, pure as mountain springs',
  'Ale, golden as harvest moon',
  'Nothing but air and dreams',
];

export default function PreferredDrink({ onContinue }: PreferredDrinkProps) {
  const { onboardingData, updateOnboardingField } = useProfileStore();
  const [selectedDrink, setSelectedDrink] = useState<string>(onboardingData.drink || '');

  useEffect(() => {
    if (selectedDrink) {
      updateOnboardingField('drink', selectedDrink);
    }
  }, [selectedDrink, updateOnboardingField]);

  const handleChange = (value: string) => {
    setSelectedDrink(value);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDrink && onContinue) {
      onContinue();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start">
      <h1 className="text-3xl">🍷 What libation dost thou favor?</h1>

      <form className="w-full my-auto flex flex-col space-y-5" onSubmit={handleContinue}>
        <>
          <span className="font-im text-lg text-brown-100">5. Select thy preferred drink — for every hero needs a draught.</span>
          <small className="ml-auto text-brown-100 opacity-40">select one</small>
        </>

        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => (
            <RadioOption
              key={option}
              value={option}
              label={option}
              checked={selectedDrink === option}
              onChange={handleChange}
            />
          ))}
        </section>

        <Button
          showQuill
          className="w-max ml-auto mt-3"
          type="submit"
          disabled={!selectedDrink}
        >
          Continue
        </Button>
      </form>
    </div>
  )
}