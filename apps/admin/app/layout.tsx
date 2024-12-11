import DashboardHeader from "@/components/DashboardHeader";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { env, getPixelServerByEnvironment, PUBLIC_URL } from "@/lib/constants";
import "./globals.css";
// import { headers } from "next/headers";
import { OnboardingProvider } from "@/components/OnboardingProvider";
import { NextStep } from "@/components/OnboardingStep";
import StatusBarWrapper from "@/components/StatusBarWrapper";
import { onboardingSteps } from "@/lib/onboarding";
import { generateStripeBillingPortalLink } from "@/utils/stripe/api";
import { createSupabaseClientForServerSide } from "@/utils/supabase/server";
import console from "console";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";

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
  // const isLogged = await isUserLogged();

  const supabase = createSupabaseClientForServerSide();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const billingPortalURL = user
    ? await generateStripeBillingPortalLink(user?.email!)
    : undefined;

  const openRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/subscribe",
    "/public",
  ];

  console.info("URL", PUBLIC_URL());

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
        <OnboardingProvider>
          <div>
            <DashboardHeader
              user={user}
              billingPortalLink={billingPortalURL}
              openRoutes={openRoutes}
            />
            <Toaster />
            <StatusBarWrapper user={user} openRoutes={openRoutes} />

            {children}
          </div>

          <NextStep steps={onboardingSteps} />
        </OnboardingProvider>
      </body>
    </html>
  );
}
