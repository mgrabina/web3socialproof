"use client";

import { OnboardingContext, onboardingSteps, Tour } from "@/lib/onboarding";
import { ReactNode, useState } from "react";

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [tours] = useState<Tour[]>(onboardingSteps); // Initialize with steps
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const start = (tourName: string) => {
    setCurrentTour(tourName);
    setCurrentStepIndex(0);
  };

  const next = () => {
    if (!currentTour) return;
    const tour = tours.find((t) => t.tour === currentTour);
    if (tour && currentStepIndex < tour.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const stop = () => {
    setCurrentTour(null);
    setCurrentStepIndex(0);
  };

  return (
    <OnboardingContext.Provider
      value={{
        tours,
        currentTour,
        currentStepIndex,
        start,
        next,
        prev,
        stop,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
