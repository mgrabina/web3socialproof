import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  apiKeyTable,
  campaignsTable,
  db,
  eq,
  impressionsTable,
} from "@web3socialproof/db";
import { getUserProtocol } from "@/utils/database/users";

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

export interface StatusBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "content">,
    VariantProps<typeof statusBarVariants> {
  status?: "info" | "warning" | "error";
  message: React.ReactNode; // Renamed to avoid conflict
}

const StatusBar = React.forwardRef<HTMLDivElement, StatusBarProps>(
  ({ className, variant, status = "info", message, ...props }, ref) => {
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

    const { icon: Icon, variant: statusVariant } = statusConfig[status];

    return (
      <div
        ref={ref}
        className={cn(statusBarVariants({ variant: statusVariant }), className)}
        {...props}
      >
        <Icon className="h-4 w-4" />
        <div>{message}</div>
      </div>
    );
  }
);
StatusBar.displayName = "StatusBar";

const getStatusBarConfig = async (): Promise<StatusBarProps> => {
  const protocol = await getUserProtocol();

  if (!protocol) {
    return {
      status: "error",
      message: "No protocol found for the user.",
    };
  }

  // Check if API keys exist
  const hasApiKeys =
    (
      await db
        .select()
        .from(apiKeyTable)
        .where(eq(apiKeyTable.protocol_id, protocol.id))
    ).length > 0;

  if (!hasApiKeys) {
    return {
      status: "warning",
      message: (
        <>
          No API keys found. Please{" "}
          <a
            href="/api-keys"
            className="underline text-blue-600 hover:text-blue-800"
          >
            create one here
          </a>
          .
        </>
      ),
    };
  }

  // Check if impressions exist
  const hasImpressions =
    (
      await db
        .select()
        .from(impressionsTable)
        .leftJoin(
          campaignsTable,
          eq(impressionsTable.campaign_id, campaignsTable.id)
        )
        .where(eq(campaignsTable.protocol_id, protocol.id))
    ).length > 0;

  if (!hasImpressions) {
    return {
      status: "warning",
      message: (
        <>
          No impressions found. Please integrate the pixel. Learn more in{" "}
          <a
            href="/api-keys"
            className="underline text-blue-600 hover:text-blue-800"
          >
            API Keys
          </a>
          .
        </>
      ),
    };
  }

  // All systems good
  return {
    status: "info",
    message: (
      <>
        Everything looks good! You can{" "}
        <a
          href="/campaigns"
          className="underline text-blue-600 hover:text-blue-800"
        >
          create a new campaign
        </a>{" "}
        .
      </>
    ),
  };
};

export default async function StatusBarWrapper() {
  const { status, message } = await getStatusBarConfig();

  return (
    <div className="flex flex-col space-y-4 p-4">
      <StatusBar status={status} message={message} />
    </div>
  );
}
