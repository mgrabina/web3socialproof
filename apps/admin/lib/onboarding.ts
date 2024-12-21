"use client";

import { createContext, ReactNode } from "react";

export interface Step {
  elementId?: string;
  title: string;
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export interface Tour {
  tour: string;
  steps: Step[];
}

export interface OnboardingContextProps {
  tours: Tour[];
  currentTour: string | null;
  currentStepIndex: number;
  start: (tourName: string) => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
}

export const OnboardingContext = createContext<OnboardingContextProps | null>(
  null
);

export const OnboardingName = "dashboardTour";
export const onboardingSteps: Tour[] = [
  {
    tour: OnboardingName,
    steps: [
      {
        title: "Welcome to Herd!",
        content:
          "In less than 15 minutes, you'll be up and improving your Protocol conversions. Let us guide you through our platform.",
        side: "top",
      },
      {
        elementId: "header-experiments-link",
        title: "Let's start with Experiments",
        content:
          "Here you can create, manage and monitor your experiments. An experiment is a group of variants that you can test against each other.",
      },
      {
        elementId: "header-variants-link",
        title: "Variants to show",
        side: "bottom",
        content:
          "Here you can create, manage and monitor your extremely customized variants, including texts, styling, etc.",
      },
      {
        elementId: "header-metrics-link",
        title: "Your own metrics",
        content:
          "We also track custom metrics in real-time for your variants. Here you can define, manage and monitor metrics automatically indexed from your contract's events such as TVL, swaps, and more.",
        side: "bottom",
      },
      {
        elementId: "header-user-menu",
        title: "Finally, your settings",
        side: "bottom",
        content:
          "Here you can manage your account, contract ownerships, and access your API keys.",
      },
      {
        elementId: "integration-guide",
        title: "Your are ready to go!",
        side: "bottom",
        content:
          "We have created your first API key, you can now start integrating Herd into your protocol.",
      },
    ],
  },
];
