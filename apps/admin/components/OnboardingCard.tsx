"use client";
import type { CardComponentProps } from "onborda";
import { useOnborda } from "onborda";
import React from "react";

export const OnboardingCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}) => {
  // Onborda hooks
  const { closeOnborda } = useOnborda();

  function handleClose() {
    closeOnborda();
  }

  return (
    <>
      <p>
        {currentStep + 1} of {totalSteps}
      </p>
      <p>
        {step.icon} {step.title}
      </p>
      <button onClick={() => closeOnborda()}>Close</button>

      <p>{step.content}</p>

      {currentStep !== 0 && (
        <button onClick={() => prevStep()}>Previous</button>
      )}
      {currentStep + 1 !== totalSteps && (
        <button onClick={() => nextStep()}>Next</button>
      )}
      {currentStep + 1 === totalSteps && (
        <button onClick={handleClose}>🎉 Finish!</button>
      )}
      <span className="text-white">{arrow}</span>
    </>
  );
};
