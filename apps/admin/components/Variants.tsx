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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { useUserContext } from "@/lib/context/useUserContext";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { SelectVariant } from "@web3socialproof/db";
import { BookCopy, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingTable } from "./LoadingTable";

export default function VariantManager() {
  const [variants, setVariants] = useState<SelectVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { protocol } = useUserContext();
  const supabase = createSupabaseClientForClientSide();
  
  
  useEffect(() => {
    
    const fetchVariants = async () => {
      try {
        if (!protocol) {
          throw new Error("No protocol found.");
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
        }
      } catch (error) {
        console.error("Failed to fetch variants:", error);
        toast({
          title: "Error",
          description: "Failed to fetch variants.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!protocol) {
      return;
    }

    fetchVariants();
  }, [protocol, supabase]);

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

  const [copying, setCopying] = useState(false);

  const duplicate = async (variant: SelectVariant) => {
    setCopying(true);
    try {
      const { data, error } = await supabase
        .from("variants_table")
        .insert({
          ...variant,
          styling: variant.styling as any,
          id: undefined,
          name: `${variant.name} (Copy)`,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error("Failed to duplicate variant");
      }

      toast({
        title: "Success",
        description: "Variant duplicated successfully",
      });

      router.push(`/variants/${data.id}`);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCopying(false);
    }
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
                  <TableHead>Message</TableHead>
                  <TableHead>Creation Date</TableHead>

                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants?.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>{variant.name}</TableCell>
                    <TableCell>{variant.message}</TableCell>
                    <TableCell>
                      {new Date(variant.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right flex space-x-2 justify-end">
                      {/* Edit Button */}
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/variants/${variant.id}`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Duplicate Button */}
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={copying}
                            onClick={() => duplicate(variant)}
                          >
                            <BookCopy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Duplicate</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Delete Button */}
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            className="text-red-500 hover:text-red-700" 
                            size="sm"
                            onClick={() => handleDeleteVariant(variant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete</p>
                        </TooltipContent>
                      </Tooltip>
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
