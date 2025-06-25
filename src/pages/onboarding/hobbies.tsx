import { useState } from "react";
import { Button } from "@/components";
import { CheckOption } from "@/components/form/check-option";

interface HobbiesProps {
  onContinue?: () => void;
}

const options = [
  'Gardening',
  'Drawing',
  'Gaming',
  'Cooking',
  'Stargazing',
  'Dancing',
  'Collecting objects',
  'Making potions (coffee/tea)',
  'Reading strange tales',
  'Puzzling or logic',
  'Singing aloud',
  'Wandering',
  'Observing people',
  'Telling stories',
  'Woodworking',
  'Alchemy (coding)',
  'Fixing broken things',
  'Journaling',
  'Hunting for oddities',
  'Studying beasts',
  'Learning new tongues',
  'Inventing machines',
  'Playing with fire',
  'Decorating spaces',
];

export default function Hobbies({ onContinue }: HobbiesProps) {
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);

  const handleChange = (value: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(value)
        ? prev.filter((hobby) => hobby !== value)
        : [...prev, value]
    );
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start">
      <h1 className="text-3xl">🎨 What passions dost thou pursue?</h1>

      <form className="w-full my-auto flex flex-col space-y-5" onSubmit={handleContinue}>
        <>
          <span className="font-im text-lg text-brown-100">3. Select thy hobbies — as many as thy heart desires.</span>
          <small className="ml-auto text-brown-100 opacity-40">select one or more</small>
        </>

        <section className="w-full grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(12em, 1fr))" }}>
          {options.map((option) => (
            <CheckOption
              key={option}
              value={option}
              label={option}
              checked={selectedHobbies.includes(option)}
              onChange={handleChange}
            />
          ))}
        </section>

        <Button
          showQuill
          className="w-max ml-auto mt-3"
          type="submit"
          disabled={selectedHobbies.length === 0}
        >
          Continue
        </Button>
      </form>
    </div>
  );
}
