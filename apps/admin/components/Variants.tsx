"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useUserContext } from "@/lib/context/useUserContext";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { SelectVariant } from "@web3socialproof/db";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAsync } from "react-async";
import { LoadingTable } from "./LoadingTable";

export default function VariantManager() {
  const [variants, setVariants] = useState<SelectVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseClientForClientSide();
  const { protocol } = useUserContext();

  useAsync(async () => {
    const fetchVariants = async () => {
      if (!protocol) {
        toast({
          title: "Error",
          description: "Failed to fetch user protocol.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("variants_table")
        .select("*")
        .eq("protocol_id", protocol?.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch variants.",
          variant: "destructive",
        });
      } else {
        setVariants(data);
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchVariants();
    setIsLoading(false);
  }, [protocol]);

  const handleDeleteVariant = async (variantId: number) => {
    async function deleteVariant(variantId: number) {
      const { error } = await supabase
        .from("variants_table")
        .delete()
        .eq("id", variantId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete variant.",
          variant: "destructive",
        });

        return;
      }

      setVariants((prevVariants) =>
        prevVariants?.filter((c) => c.id !== variantId)
      );
    }

    setIsLoading(true);
    await deleteVariant(variantId);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Variants</h1>
        <a href="/variants/create">
          <Button className="gap-2">Create Variant</Button>
        </a>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <LoadingTable />
          ) : (
            <Table className="pt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Creation Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants?.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>{variant.name}</TableCell>
                    {/* <TableCell>
                      {variant.enabled ? "Active" : "Paused"}
                    </TableCell> */}
                    {/* <TableCell>{variant.type}</TableCell> */}
                    <TableCell>
                      {new Date(variant.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right flex space-x-2 justify-end">
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/variants/${variant.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVariant(variant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {variants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No variants found. Create a new one by clicking the button
                      above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
