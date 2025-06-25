import { useState, useEffect } from "react";
import { Button } from "@/components";
import { RadioOption } from "@/components/form/radio-option";
import { useProfileStore } from "@/store/useProfileStore";

interface CurrentRoleProps {
  onContinue?: () => void;
}

const options = [
  'Artist of Digital Realms (Design, Engineering)',
  'Keeper of Ancient Wisdom (Teacher)',
  'Healer of Bodies and Souls (Healthcare)',
  'Merchant (Entrepreneur, Businessperson)',
  'Guardian of Justice',
  'Weaver of Stories (Content Creator)',
  'Seeker of Knowledge (Student)',
  'Wanderer Between Worlds (Explorer)',
];

export default function CurrentRole({ onContinue }: CurrentRoleProps) {
  const { onboardingData, updateOnboardingField } = useProfileStore();
  const [selectedRole, setSelectedRole] = useState<string>(onboardingData.role || '');

  useEffect(() => {
    if (selectedRole) {
      updateOnboardingField('role', selectedRole);
    }
  }, [selectedRole, updateOnboardingField]);

  const handleChange = (value: string) => {
    setSelectedRole(value);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole && onContinue) {
      onContinue();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start">
      <h1 className="text-3xl">🎭 And what path dost thou walk in this time?</h1>

      <form className="w-full my-auto flex flex-col space-y-5" onSubmit={handleContinue}>
        <>
        <span className="font-im text-lg text-brown-100">2. Select thy modern role — so thy mirror self might twist or reflect it.</span>
        <small className="ml-auto text-brown-100 opacity-40">select one</small>
        </>

        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => (
            <RadioOption
              key={option}
              value={option}
              label={option}
              checked={selectedRole === option}
              onChange={() => handleChange(option)}
            />
          ))}
        </section>

        <Button
          showQuill
          className="w-max ml-auto mt-3"
          type="submit"
          disabled={!selectedRole}
        >
          Continue
        </Button>
      </form>
    </div>
  );
}