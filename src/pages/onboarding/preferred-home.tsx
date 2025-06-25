import { useState } from "react";
import { Button } from "@/components";
import { RadioOption } from "@/components/form/radio-option";

interface PreferredHomeProps {
  onContinue?: () => void;
}

const options = [
  'A cottage in the woods',
  'A bustling stone town',
  'A seaside shack',
  'A mountaintop vineyard',
  'A sun-kissed tent in far lands',
  'A quiet home in the suburbs',
];

export default function PreferredHome({ onContinue }: PreferredHomeProps) {
  const [selectedHome, setSelectedHome] = useState<string | null>(null);

  const handleChange = (value: string) => {
    setSelectedHome(value);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start">
      <h1 className="text-3xl">🏰 Where dost thou call home?</h1>

      <form className="w-full my-auto flex flex-col space-y-5" onSubmit={handleContinue}>
        <>
          <span className="font-im text-lg text-brown-100">2. Select thy preferred home — for every journey starts somewhere.</span>
          <small className="ml-auto text-brown-100 opacity-40">select one</small>
        </>

        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => (
            <RadioOption
              key={option}
              value={option}
              label={option}
              checked={selectedHome === option}
              onChange={handleChange}
            />
          ))}
        </section>

        <Button
          showQuill
          className="w-max ml-auto mt-3"
          type="submit"
          disabled={!selectedHome}
        >
          Continue
        </Button>
      </form>
    </div>
  )
}
