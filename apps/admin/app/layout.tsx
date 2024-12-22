import DashboardHeader from "@/components/DashboardHeader";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { env, getPixelServerByEnvironment } from "@/lib/constants";
import "./globals.css";
import { OnboardingProvider } from "@/components/OnboardingProvider";
import { Onboarding } from "@/components/OnboardingStep";
import StatusBarWrapper from "@/components/StatusBarWrapper";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getServerContext } from "@/lib/context/serverContext";
import { generateStripeBillingPortalFromProtocolServerSide } from "@/utils/stripe/api";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Herd",
  description: "The ultimate marketing tool to increase conversions in web3",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, user, protocol } = await getServerContext();

  const billingPortalLink = protocol
    ? await generateStripeBillingPortalFromProtocolServerSide(protocol)
    : undefined;
  const HERD_API_KEY = "sk_test_51sxGqT3cQ3FiKPoJbHPCCJ6qq7I06XvIc";

  return (
    <html lang="en">
      <head>
        {/* Notification set in Landing */}
        <script
          src={`${getPixelServerByEnvironment(
            env
          )}?env=${env}&apiKey=${HERD_API_KEY}`}
          async
        ></script>
        <script
          async
          src="https://js.stripe.com/v3/pricing-table.js"
          defer
        ></script>
      </head>
      <body className={inter.className}>
        <Analytics />
        {/* <TooltipProvider> */}
          <OnboardingProvider>
            <div>
              <DashboardHeader billingPortalLink={billingPortalLink} />
              <StatusBarWrapper />

              {/* Content */}
              {children}
            </div>

            <Toaster />
            <Onboarding />
          </OnboardingProvider>
        {/* </TooltipProvider> */}
      </body>
    </html>
  );
}
