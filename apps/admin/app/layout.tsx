import DashboardHeader from "@/components/DashboardHeader";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { env, getPixelServerByEnvironment } from "@/lib/constants";
import "./globals.css";
// import { headers } from "next/headers";
import StatusBarWrapper from "@/components/StatusBarWrapper";
import { generateStripeBillingPortalLink } from "@/utils/stripe/api";
import { createSupabaseClientForServerSide } from "@/utils/supabase/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Herd",
  description: "The ultimate marketing tool to increase conversions in web3",
};

const apiKey = "sk_test_51hGXLs7gUOVBHKGjehbwK2kNo9BoJanNX";

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

  return (
    <html lang="en">
      <head>
        <script
          src={`${getPixelServerByEnvironment(
            env
          )}?env=${env}&apiKey=${apiKey}`}
          async
        ></script>
        <script
          async
          src="https://js.stripe.com/v3/pricing-table.js"
          defer
        ></script>
      </head>
      <body className={inter.className}>
        <DashboardHeader
          user={user}
          billingPortalLink={billingPortalURL}
          openRoutes={openRoutes}
        />
        <StatusBarWrapper user={user} openRoutes={openRoutes} />

        {children}
      </body>
    </html>
  );
}
