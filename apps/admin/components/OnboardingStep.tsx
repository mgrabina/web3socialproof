"use client";

import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Tour } from "@/lib/onboarding";
import { useEffect, useState } from "react";

export const NextStep = ({ steps }: { steps: Tour[] }) => {
  const { currentTour, currentStepIndex, next, prev, stop } = useOnboarding();
  const [highlightRect, setHighlightRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!currentTour) return;

    const tour = steps.find((t) => t.tour === currentTour);
    if (!tour) return;

    const currentStep = tour.steps[currentStepIndex];
    if (!currentStep) return;

    if (currentStep.elementId) {
      const target = document.getElementById(currentStep.elementId);
      if (target) {
        const rect = target.getBoundingClientRect();
        setHighlightRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        console.warn("Selector not found:", currentStep.elementId);
        setHighlightRect(null); // No target to highlight
      }
    } else {
      setHighlightRect(null); // No selector, no highlight
    }
  }, [currentTour, currentStepIndex, steps]);

  if (!currentTour) return null;

  const tour = steps.find((t) => t.tour === currentTour);
  const currentStep = tour?.steps[currentStepIndex];

  if (!currentStep) return null;

  const isLast = currentStepIndex === (tour?.steps.length || 0) - 1;

  return (
    <>
      {/* Background Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black
          zIndex: 9998,
          pointerEvents: "none", // Prevent blocking interactions
        }}
      ></div>

      {/* Highlight Box */}
      {highlightRect && (
  <div
    style={{
      position: "absolute",
      top: highlightRect.top - 4, // Add padding outside the border
      left: highlightRect.left - 4, // Add padding outside the border
      width: highlightRect.width + 8, // Adjust width to accommodate the space
      height: highlightRect.height + 8, // Adjust height to accommodate the space
      borderRadius: "8px", // Keep the border rounded
      background: "transparent", // Ensure no background
      boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.5), 0 0 0 6px rgba(199, 146, 234, 1), 0 0 0 8px rgba(147, 126, 255, 1)", // Gradient border layers
      zIndex: 9999,
      pointerEvents: "none", // Prevent blocking interactions
    }}
    className="animate-pulse"
  ></div>
)}


      {/* Tooltip in the Center */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          background: "white",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h3 className="text-xl font-semibold text-gray-800">
          {currentStep.title}
        </h3>
        <p className="text-sm text-gray-600 mt-2">{currentStep.content}</p>
        <div className="flex justify-between mt-6">
          <Button onClick={prev} disabled={currentStepIndex === 0}>
            Previous
          </Button>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={stop}>
              Skip
            </Button>
            <Button onClick={() => (!isLast ? next() : stop())}>
              {isLast ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
