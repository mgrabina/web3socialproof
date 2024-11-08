import DashboardHeader from "@/components/DashboardHeader";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { db, eq, protocolTable, usersTable } from "@web3socialproof/db";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Talaria Protocol",
    description: "The ultimate marketing tool to increase conversions in web3",
  };

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if user has plan selected. If not redirect to subscibe
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // check user plan in db
  const checkUserInDB = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user!.email!));

  const checkProtocolInDB = await db
    .select()
    .from(protocolTable)
    .where(eq(protocolTable.id, checkUserInDB[0].protocol_id!));

  if (checkProtocolInDB[0].plan === "none") {
    console.log("User has no plan selected");
    return redirect("/subscribe");
  }

  return (
    <html lang="en">
      <DashboardHeader />
      {children}
    </html>
  );
}
