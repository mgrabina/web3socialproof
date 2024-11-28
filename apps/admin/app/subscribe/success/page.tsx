"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SubscribeSuccess() {
  // @todo : if local, trigger stripe webhook to update user plan, otherwise use supabase to update user plan

  const [counter, setCounter] = useState(5);
  const router = useRouter();

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => {
        setCounter(counter - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      router.push("/"); // Redirect to the dashboard or home page
    }
  }, [counter, router]);

  return (
    <div className="flex items-center justify-center bg-muted min-h-screen">
      <Card className="w-[350px] mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex justify-center py-4">
            <Link href="/">
              <Image src="/logo/horizontal.png" alt="logo" width={50} height={50} />
            </Link>
          </div>

          <CardTitle className="text-2xl font-bold">Success</CardTitle>
          <CardDescription>Thank you for subscribing!</CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <p>You will be redirected in {counter} seconds...</p>
        </CardContent>

        <CardFooter className="flex-col text-center">
          <Button className="w-full text-sm">
            <Link href="/">Go To Dashboard Now</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
