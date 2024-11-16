import DashboardHeader from "@/components/DashboardHeader";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createClient } from "@/utils/supabase/server";
import { redirect, usePathname, useRouter } from "next/navigation";
import { db, eq, protocolTable, usersTable } from "@web3socialproof/db";

import "./globals.css";
import { env, getPixelServerByEnvironment } from "@/lib/constants";
import { headers } from "next/headers";
import { cp } from "fs";
import StatusBarWrapper from "@/components/StatusBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Herd",
  description: "The ultimate marketing tool to increase conversions in web3",
};

const apiKey = "sk_test_51hGXLs7gUOVBHKGjehbwK2kNo9BoJanNX";

async function isUserLogged() {
  const headersList = headers();
  const header_url = headersList.get("x-url") || "";

  const supabase = createClient();

  if (header_url.includes("login") || header_url.includes("subscribe")) {
    return false;
  }

  // Fetch authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return false;
  }

  // Check user in the database
  const userInDB = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email));

  if (userInDB.length === 0) {
    return false;
  }

  // Check the user's protocol and plan
  const protocol = await db
    .select()
    .from(protocolTable)
    .where(eq(protocolTable.id, userInDB[0].protocol_id!));

  if (protocol.length === 0 || protocol[0].plan === "none") {
    return false;
  }

  return true;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLogged = await isUserLogged();

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
        {isLogged && (
          <>
            <DashboardHeader />
            <StatusBarWrapper />
          </>
        )}
        {children}
      </body>
    </html>
  );
}
