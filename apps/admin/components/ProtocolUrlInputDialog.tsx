"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useUserContext } from "@/lib/context/useUserContext";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { useState } from "react";
import { z } from "zod";
import { Input } from "./ui/input";

export default function ProtocolUrlInputDialog({
  open,
  setOpen,
  setUrl: setProtocolUrl,
}: {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  setUrl: (url: string) => void;
}) {
  const [url, setUrl] = useState<string | null>();
  const { protocol } = useUserContext();
  const supabase = createSupabaseClientForClientSide();

  const handleSaveUrl = async () => {
    try {
      if (!protocol) {
        throw new Error("No protocol found.");
      }
      if (!url) {
        throw new Error("No URL provided.");
      }

      const { error } = await supabase.from("protocol_table").upsert({
        id: protocol.id,
        url,
      });

      if (error) {
        throw error;
      }

      setProtocolUrl(url);

      toast({
        title: "URL saved",
        description: "The URL was successfully saved. You can now generate variants.",
      });

      setOpen(false);
    } catch (error) {
      console.error("Failed to save URL:", error);
      toast({
        title: "Error",
        description: "Failed to save URL.",
        variant: "destructive",
      });
    }
  };

  const zodUrlSchema = z.string().url();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-opacity-90 transition-opacity duration-300 ease-in-out">
        <DialogHeader>
          <DialogTitle>Protocol's URL</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <label className="block">
            Before generating customized variants, our IA needs your protocol's
            URL to see how it looks like.
          </label>

          <div className="flex items-center space-x-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <Input
                type="url"
                value={url ?? undefined}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://uniswap.org"
                className={`block w-full px-4 py-2 border rounded-md
                    ${
                      url && !zodUrlSchema.safeParse(url).success
                        ? "border-red-500"
                        : "border-gray-300"
                    }
                  `}
              />
            </div>
            <div></div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSaveUrl}
            disabled={!url || !zodUrlSchema.safeParse(url).success}
            variant="default"
            className="mt-6"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
