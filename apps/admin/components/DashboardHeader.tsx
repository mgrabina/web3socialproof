"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardHeaderProfileDropdown from "./DashboardHeaderProfileDropdown";

export default function DashboardHeader({
  user,
  billingPortalLink,
  openRoutes,
}: {
  user: User | null;
  billingPortalLink?: string;
  openRoutes: string[];
}) {
  const [isLogged, setIsLogged] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if the current route is an open route
    const isOpenRoute = openRoutes.some((route) => pathname?.startsWith(route));

    // Skip login checks for open routes
    if (isOpenRoute) {
      setIsLogged(false);
      return;
    }

    // Function to check login status
    const checkLoggedInStatus = async () => {
      setIsLogged(!!user?.email);
    };

    checkLoggedInStatus();
  }, [pathname, user?.email]); // Re-run whenever the route changes

  if (!isLogged) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-2 flex items-center space-x-2" href="/">
            <Image
              src="/logo/horizontal.svg"
              alt="logo"
              className="p-6"
              width={150}
              height={150}
            />
          </Link>
          {/* <Suspense fallback={<Badge variant="outline" className="mr-2"><Skeleton className="w-[50px] h-[20px] rounded-full" /></Badge>}>
                        <Badge variant="outline" className="mr-2 min-w-[60px]">{stripePlan}</Badge>
                    </Suspense> */}
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              className="transition-colors hover:text-foreground/80 text-foreground"
              href="/campaigns"
              id="header-campaigns-link"
            >
              Campaigns
            </Link>
            <Link
              className="transition-colors hover:text-foreground/80 text-foreground"
              href="/metrics"
              id="header-metrics-link"
            >
              Metrics
            </Link>
          </nav>
        </div>
        <Button variant="outline" size="icon" className="mr-2 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* <div className="w-full flex-1 md:w-auto md:flex-none">
                        <form>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search..."
                                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                />
                            </div>
                        </form>
                    </div> */}
          <DashboardHeaderProfileDropdown
            user={user}
            billingPortalLink={billingPortalLink}
          />
        </div>
      </div>
    </header>
  );
}
