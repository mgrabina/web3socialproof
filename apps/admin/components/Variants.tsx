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
import { SelectVariant } from "@web3socialproof/db";
import { Edit, Pause, Play, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingTable } from "./LoadingTable";

export default function VariantManager() {
  const [variants, setVariants] = useState<SelectVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchVariants() {
      setIsLoading(true);
      try {
        const response = await fetch("/variants/api");
        const data = await response.json();

        if (response.ok) setVariants(data);
      } catch (error) {
        console.error("Error fetching variants:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVariants();
  }, []);

  const handleDeleteVariant = async (variantId: number) => {
    try {
      await fetch(`/variants/api/${variantId}`, {
        method: "DELETE",
      });
      setVariants(variants.filter((c) => c.id !== variantId));
      toast({
        title: "Success!",
        description: "Variant deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete variant.",
        variant: "destructive",
      });
    }
  };

  // const handleToggleVariantStatus = async (variant: SelectVariant) => {
  //   try {
  //     const updatedVariant = { ...variant, enabled: !variant.enabled };
  //     await fetch(`/variants/api/${variant.id}`, {
  //       method: "PATCH",

  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(updatedVariant),
  //     });
  //     setVariants((prevVariants) =>
  //       prevVariants?.map((c) => (c.id === variant.id ? updatedVariant : c))
  //     );
  //     toast({
  //       title: `Variant ${variant.enabled ? "Paused" : "Activated"}`,
  //       description: `Variant "${variant.name}" has been ${
  //         variant.enabled ? "paused" : "activated"
  //       }.`,
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to update variant status.",
  //       variant: "destructive",
  //     });
  //   }
  // };

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
            <Table>
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
