import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import Introduction from './intro';
import CurrentRole from './current-role';
import Hobbies from './hobbies';
import Gender from './gender';
import PreferredDrink from './preferred-drink';
import PreferredHome from './preferred-home';
import RandomQuestion from './random-question';

const ONBOARDING_STEPS = [
  'intro',
  'role', 
  'hobbies',
  'gender',
  'drink',
  'home',
  'random-question'
] as const;

type OnboardingStep = typeof ONBOARDING_STEPS[number];

const STEP_COMPONENTS: Record<OnboardingStep, React.ComponentType<{ onContinue?: () => void }>> = {
  'intro': Introduction,
  'role': CurrentRole,
  'hobbies': Hobbies,
  'gender': Gender,
  'drink': PreferredDrink,
  'home': PreferredHome,
  'random-question': RandomQuestion,
};

export default function OnboardingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const getCurrentStep = useCallback((): OnboardingStep => {
    const pathParam = searchParams.get('path') as OnboardingStep;
    return pathParam && ONBOARDING_STEPS.includes(pathParam) ? pathParam : 'intro';
  }, [searchParams]);

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(getCurrentStep);

  useEffect(() => {
    const step = getCurrentStep();
    setCurrentStep(step);
    
    if (!searchParams.get('path')) {
      setSearchParams({ path: 'intro' });
    }
  }, [searchParams, getCurrentStep, setSearchParams]);

  const handleContinue = () => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < ONBOARDING_STEPS.length) {
      const nextStep = ONBOARDING_STEPS[nextIndex];
      setSearchParams({ path: nextStep });
      setCurrentStep(nextStep);
    } else {
      navigate('/reveal');
    }
  };

  const CurrentComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="w-full h-full">
      <CurrentComponent onContinue={handleContinue} />
    </div>
  );
}