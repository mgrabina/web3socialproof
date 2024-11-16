"use client";


import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAsync } from "react-async";

const statusBarVariants = cva(
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        info: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        warning:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
export type StatusBarConfig = {
  status: "info" | "warning" | "error";
  message: React.ReactNode; // Renamed to avoid conflict
}

const StatusBar = ({
  status,
  message,
}: StatusBarConfig) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const statusConfig = {
    info: {
      icon: Info,
      variant: "info" as const,
    },
    warning: {
      icon: AlertCircle,
      variant: "warning" as const,
    },
    error: {
      icon: XCircle,
      variant: "error" as const,
    },
  };

  if (!isVisible) return null;

  const icon = statusConfig[status!].icon;

  return (
    <div
      className={cn(
        "relative flex items-center justify-between",
        statusBarVariants({ variant: statusConfig[status!].variant })
      )}
    >
      <div className="flex items-center">
        {React.createElement(icon, { className: "h-4 w-4" })}
        <div className="ml-2">{message}</div>
      </div>
      <button
        className="absolute right-2 top-2 flex items-center justify-center w-4 h-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default StatusBar;
