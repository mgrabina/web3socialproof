"use client";

import { logout } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserContext } from "@/lib/context/useUserContext";
import {
  Key,
  LogOut,
  ReceiptText,
  User as UserIcon,
  Verified,
} from "lucide-react";
import Link from "next/link";
import { FaTelegramPlane } from "react-icons/fa";

export default function DashboardHeaderProfileDropdown({
  billingPortalLink,
}: {
  billingPortalLink?: string;
}) {
  const { user } = useUserContext();

  return (
    <nav className="flex items-center">
      {/* <Button variant="ghost" size="icon" className="mr-2">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
            </Button> */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" id="header-user-menu">
            <UserIcon className="h-4 w-4" />
            <span className="sr-only">Open user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {user?.name && (
            <>
              <DropdownMenuLabel>
                Hi, {user?.name.split(" ")[0]}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          {/* <Link href="#">
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                    </Link> */}
          <Link href="/api-keys">
            <DropdownMenuItem className="cursor-pointer">
              <Key className="mr-2 h-4 w-4" />
              <span>Api Keys</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/contracts">
            <DropdownMenuItem className="cursor-pointer">
              <Verified className="mr-2 h-4 w-4" />
              <span>Contracts</span>
            </DropdownMenuItem>
          </Link>
          <Link href="#">
            <DropdownMenuItem className="cursor-pointer">
              <ReceiptText className="mr-2 h-4 w-4" />
              <Link target="_blank" href={billingPortalLink ?? "#"}>
                Billing
              </Link>
            </DropdownMenuItem>
          </Link>

          <Link href="https://t.me/+os2FdFkUrlsxZWZh" target="_blank">
            <DropdownMenuItem className="cursor-pointer">
              <FaTelegramPlane className="mr-2 h-4 w-4" />
              <Link href="https://t.me/+os2FdFkUrlsxZWZh" target="_blank">
                Support
              </Link>
            </DropdownMenuItem>
          </Link>
          {/* <Link href="#">
                        <DropdownMenuItem>
                            <HelpCircle className="mr-2 h-4 w-4" />
                            <span>Help</span>
                        </DropdownMenuItem>
                    </Link> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <form action={logout} className="w-full">
              <button type="submit" className="w-full flex">
                <LogOut className="mr-2 h-4 w-4" />
                <span> Log out</span>
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
