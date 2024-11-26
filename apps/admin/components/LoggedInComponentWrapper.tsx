"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { createSupabaseClientForServerSide } from "@/utils/supabase/server";

// Function to check if the user is logged in
async function checkUserLoggedIn() {
  const supabase = createSupabaseClientForServerSide();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return false;
  }

  return true; // Assuming no further DB validation is needed for simplicity
}

export const LoggedInComponentWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLogged, setIsLogged] = useState(false);
  const pathname = usePathname();

  // Check login state on initial load and when the pathname changes
  useEffect(() => {
    const fetchLoggedInState = async () => {
      const loggedIn = await checkUserLoggedIn();
      setIsLogged(loggedIn);
    };

    fetchLoggedInState();
  }, [pathname]); // Re-run check when the route changes

  if (!isLogged) {
    return null;
  }

  return <>{children}</>;
};
