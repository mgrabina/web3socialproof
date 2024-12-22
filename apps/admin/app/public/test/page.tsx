"use client";

import { toast } from "@/hooks/use-toast";
import { env } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function NotificationTest() {
  const router = useRouter();
  if (env === "production") {
    router.push("/404");
  }

  async function convert() {
    window.herd.trackConversion("test");
    toast({
      title: "Conversion Tracked",
    });
  }

  return (
    <div>
      <h1>Notification Test</h1>

      <button onClick={convert} className="btn btn-primary">
        Convert
      </button>
    </div>
  );
}
