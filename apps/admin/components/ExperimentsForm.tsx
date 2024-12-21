"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import {
  InsertVariant,
  InsertVariantPerExperiment,
  SelectExperiment,
  SelectVariant,
  SelectVariantPerExperiment,
} from "@web3socialproof/db";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExperimentsForm({ id: paramId }: { id?: number }) {
  const [experiment, setExperiment] = useState<
    Partial<SelectExperiment> | undefined
  >();
  const [variants, setVariants] = useState<
    Partial<SelectVariantPerExperiment>[] | undefined
  >();
  const [availableVariants, setAvailableVariants] = useState<SelectVariant[]>();
  const [loadingAvailableVariants, setLoadingAvailableVariants] =
    useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { protocol } = useUserContext();
  const supabase = createSupabaseClientForClientSide();

  const router = useRouter();

  
  
  useEffect(() => {
    async function fetchExperiment(_id: number) {
      try {
        const { data: experiment, error } = await supabase
          .from("experiments_table")
          .select()
          .eq("id", _id)
          .single();
  
        if (error || !experiment) {
          throw error;
        }
  
        setExperiment(experiment);
  
        const { data: variants, error: variantsError } = await supabase
          .from("variants_per_experiment_table")
          .select()
          .eq("experiment_id", _id);
  
        if (variantsError || !variants) {
          throw variantsError;
        }
  
        setVariants(variants);
      } catch (error) {
        console.error("Error fetching experiment:", error);
        toast({
          title: "Error",
          description: "Failed to fetch experiment.",
          variant: "destructive",
        });
      } finally {
        setHasLoaded(true);
      }
    }
    
    if (paramId !== undefined) {
      fetchExperiment(paramId);
    } else {
      setHasLoaded(true);
    }
  }, [paramId, supabase]);

  useEffect(() => {
    async function loadAvailableVariants() {
      setLoadingAvailableVariants(true);
      const { data: availableVariants, error } = await supabase
        .from("variants_table")
        .select()
        .filter("protocol_id", "eq", protocol?.id);
  
      setLoadingAvailableVariants(false);
      if (error || !availableVariants) {
        throw error;
      }
  
      setAvailableVariants(availableVariants);
    }

    if (protocol) {
      loadAvailableVariants();
    }
  }, [protocol, supabase]);

  const [currentVariant, setCurrentVariant] = useState<
    Partial<InsertVariantPerExperiment>
  >({
    experiment_id: experiment?.id,
    variant_id: 0,
    percentage: 0,
  });

  const handleAddVariant = () => {
    setVariants([
      ...(variants ?? []),
      {
        ...currentVariant,
        variant_id:
          currentVariant.variant_id === 0 ? null : currentVariant.variant_id,
      },
    ]);
    setCurrentVariant({
      experiment_id: experiment?.id,
      variant_id: 0,
      percentage: 0,
    });
  };

  const handleDeleteVariant = (index: number) => {
    setVariants(variants?.filter((_, i) => i !== index));
  };

  const handleVariantChange = (field: string, value: any) => {
    setCurrentVariant({ ...currentVariant, [field]: value });
  };

  const handleVariantChanges = (values: Partial<InsertVariant>) => {
    setCurrentVariant({ ...currentVariant, ...values });
  };

  const handleSubmit = async () => {
    if (!experiment) {
      return;
    }

    let experimentId;
    if (paramId) {
      // Update
      const { data, error } = await supabase
        .from("experiments_table")
        .update(experiment)
        .eq("id", paramId);

      experimentId = paramId;
    } else {
      if (experiment?.name === undefined) {
        toast({
          title: "Error",
          description: "Please provide a name for the experiment.",
          variant: "destructive",
        });
        return;
      }

      // Create
      const { data, error } = await supabase
        .from("experiments_table")
        .insert({
          ...experiment,
          name: experiment.name,
          protocol_id: protocol?.id,
          enabled: experiment.enabled === undefined ? true : experiment.enabled,
        })
        .returns<SelectExperiment>();

      experimentId = data?.id;
    }

    if (!experimentId) {
      toast({
        title: "Error",
        description: "Failed to create experiment.",
        variant: "destructive",
      });
      return;
    }

    const currentExperimentVariants = await supabase
      .from("variants_per_experiment_table")
      .select()
      .eq("experiment_id", experimentId);

    const currentExperimentVariantsIds = currentExperimentVariants?.data?.map(
      (v) => v.variant_id
    );

    const variantsToInsert = variants?.filter(
      (v) => !currentExperimentVariantsIds?.includes(v.variant_id ?? null)
    );
    const variantsToDeleteFromExperiment =
      currentExperimentVariants?.data?.filter(
        (v) => !variants?.map((v) => v.variant_id).includes(v.variant_id)
      );

    // Insert new variants
    if (variantsToInsert?.length) {
      await supabase.from("variants_per_experiment_table").insert(
        variantsToInsert.map((v) => ({
          ...v,
          percentage: v.percentage ?? 0,
          experiment_id: experimentId,
        }))
      );
    }

    // Delete variants
    if (variantsToDeleteFromExperiment?.length) {
      await supabase
        .from("variants_per_experiment_table")
        .delete()
        .eq("experiment_id", experimentId)
        .in(
          "id",
          variantsToDeleteFromExperiment.map((v) => v.id)
        );
    }

    toast({
      title: "Experiment Updated",
      description: "Experiment updated successfully.",
    });

    router.push("/experiments");
  };

  const [isLoading, setIsLoading] = useState(false);

  const totalPercentage =
    variants?.reduce((acc, variant) => acc + (variant.percentage ?? 0), 0) ?? 0;

  const handleHostnameRemove = (index: number) => {
    const updatedHostnames = experiment?.hostnames?.filter(
      (_: any, i: number) => i !== index
    );
    setExperiment((prev: any) => ({
      ...prev,
      hostnames: updatedHostnames,
    }));
  };

  const handlePathnameRemove = (index: number) => {
    const updatedPathnames = experiment?.pathnames?.filter(
      (_: any, i: number) => i !== index
    );
    setExperiment((prev: any) => ({
      ...prev,
      pathnames: updatedPathnames,
    }));
  };

  const isValidRegex = (value: string): boolean => {
    if (value.startsWith("^") && value.endsWith("$")) {
      try {
        new RegExp(value);
        return true;
      } catch (e) {
        return false;
      }
    }
    return true; // Non-regex inputs are always valid
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Experiment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Swaps Experiment AB Testing"
              value={experiment?.name ?? undefined}
              onChange={(e) => ({ ...experiment, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            {" "}
            <Label htmlFor="description">Variants</Label>
            <br />
            <Table
              className="w-full
              border
              rounded-sm
              
              "
            >
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>% (Total: {totalPercentage}%)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants?.map(
                  (variant: Partial<InsertVariantPerExperiment>, index) => (
                    <TableRow key={`variant-${variant.variant_id}`}>
                      <TableCell>{variant.variant_id}</TableCell>
                      <TableCell>
                        {availableVariants?.find(
                          (v) => v.id === variant.variant_id
                        )?.name ?? "Empty Variant"}
                      </TableCell>
                      <TableCell>{variant.percentage}%</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteVariant(index)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )}
                {!variants?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No variants added yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Advanced Options</AccordionTrigger>
              <AccordionContent className="p-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={
                          experiment?.enabled === undefined
                            ? true
                            : experiment?.enabled
                        }
                        onCheckedChange={(checked) =>
                          setExperiment((prev) => ({
                            ...prev,
                            enabled: checked,
                          }))
                        }
                      />

                      <Label htmlFor="airplane-mode">Enabled by default</Label>
                    </div>
                  </div>
                </div>

                <br />
                <div className="space-y-2">
                  <Label>Allowed Domains</Label>
                  <p className="text-sm text-gray-500">
                    Specify domains where this experiment is allowed to run.
                    Domains should not include protocols (e.g., use example.com
                    instead of https://example.com). All domains are allowed by
                    default.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {experiment?.hostnames?.map(
                      (hostname: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="flex items-center space-x-2 px-2 py-1"
                        >
                          <span>{hostname}</span>
                          <button
                            onClick={() => handleHostnameRemove(index)}
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                          >
                            ✕
                          </button>
                        </Badge>
                      )
                    )}
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      placeholder="Add a domain (e.g., example.com)"
                      id="domain-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // Prevent form submission
                          const value = (
                            e.target as HTMLInputElement
                          ).value.trim();
                          if (value) {
                            setExperiment((prev) => ({
                              ...prev,
                              hostnames: [...(prev?.hostnames ?? []), value],
                            }));
                            (e.target as HTMLInputElement).value = ""; // Clear input field
                          } else {
                            toast({
                              title: "Invalid Hostname",
                              description: "Please enter a valid hostname.",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(
                          "domain-input"
                        ) as HTMLInputElement;
                        if (input) {
                          const value = input.value.trim();
                          if (value) {
                            setExperiment((prev) => ({
                              ...prev,
                              hostnames: [...(prev?.hostnames ?? []), value],
                            }));
                            input.value = ""; // Clear input field
                          } else {
                            toast({
                              title: "Invalid Hostname",
                              description: "Please enter a valid hostname.",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <br />
                <div className="space-y-2">
                  <Label>Allowed Pages</Label>
                  <p className="text-sm text-gray-500">
                    Specify on which pages this variant is allowed to run. You
                    can use regex for advanced matching (e.g.,{" "}
                    <code>^/metrics$</code>). By default, all pages are allowed.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {experiment?.pathnames?.map(
                      (pathname: string, index: number) => {
                        const isValid = isValidRegex(pathname);
                        return (
                          <Badge
                            key={index}
                            variant="outline"
                            className="flex items-center space-x-2 px-2 py-1"
                            title={!isValid ? "Invalid regex pattern" : ""}
                          >
                            <span
                              className={`${!isValid ? "text-red-500" : ""}`}
                            >
                              {pathname}
                            </span>
                            <button
                              onClick={() => handlePathnameRemove(index)}
                              className="text-red-500 hover:text-red-700 focus:outline-none"
                            >
                              ✕
                            </button>
                          </Badge>
                        );
                      }
                    )}
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      placeholder="Add a pathname or regex (e.g., ^/metrics$)"
                      id="pathname-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // Prevent form submission
                          const value = (
                            e.target as HTMLInputElement
                          ).value.trim();
                          // const isRegex =
                          //   value.startsWith("^") && value.endsWith("$");
                          // const isValid = isRegex ? isValidRegex(value) : true;

                          // if (!isValid) {
                          //   toast({
                          //     title: "Invalid Regex",
                          //     description: "Please enter a valid regex pattern.",
                          //     variant: "destructive",
                          //   });
                          //   return;
                          // }

                          if (value) {
                            setExperiment((prev) => ({
                              ...prev,
                              pathnames: [...(prev?.pathnames ?? []), value],
                            }));
                            (e.target as HTMLInputElement).value = ""; // Clear input field
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(
                          "pathname-input"
                        ) as HTMLInputElement;
                        if (input) {
                          const value = input.value.trim();
                          // const isRegex =
                          //   value.startsWith("^") && value.endsWith("$");
                          // const isValid = isRegex ? isValidRegex(value) : true;

                          // if (!isValid) {
                          //   toast({
                          //     title: "Invalid Regex",
                          //     description: "Please enter a valid regex pattern.",
                          //     variant: "destructive",
                          //   });
                          //   return;
                          // }

                          if (value) {
                            setExperiment((prev) => ({
                              ...prev,
                              pathnames: [...(prev?.pathnames ?? []), value],
                            }));
                            input.value = ""; // Clear input field
                          }
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <br />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {!!variants?.length && totalPercentage !== 100 && (
            <div className="text-red-500">Total percentage should be 100%</div>
          )}

          <Button
            className="w-full"
            variant="default"
            onClick={async () => {
              setIsLoading(true); // Set loading state
              try {
                await handleSubmit(); // Perform the submit action
              } catch (error) {
                console.error("Error:", error);
              } finally {
                setIsLoading(false); // Reset loading state
              }
            }}
            disabled={
              isLoading || !variants?.length || totalPercentage !== 100 // Disable button when total percentage is not 100
            } // Disable button during loading
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span>Loading...</span>
              </span>
            ) : (
              <>{paramId ? "Update Experiment" : "Create Experiment"}</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Variant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Variant</Label>
            {loadingAvailableVariants ? (
              <div>Loading variants...</div>
            ) : !availableVariants?.length ? (
              <div className="text-red-500">
                No variants available. Please create yours{" "}
                <Link
                  href="/variants/create
                "
                  className="text-blue-500 hover:underline hover:text-blue-700"
                >
                  here
                </Link>
              </div>
            ) : (
              <Select
                value={currentVariant.variant_id?.toString()}
                onValueChange={(value) =>
                  handleVariantChange("variant_id", Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Variant" />
                </SelectTrigger>
                <SelectContent>
                  {availableVariants?.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id.toString()}>
                      {variant.name}
                    </SelectItem>
                  ))}
                  {/* Empty Variant for AB Testing */}
                  <SelectItem key={0} value={"0"}>
                    Empty Variant (for AB Testing)
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <br />

          <div className="space-y-2">
            <Label>Percentage</Label>
            <Input
              autoComplete="on"
              placeholder="50"
              min={0}
              max={100}
              value={currentVariant.percentage}
              onChange={(e) =>
                handleVariantChange("percentage", e.target.value)
              }
              prefix="%"
            />
          </div>

          <Button
            className="w-full mt-4"
            variant="default"
            disabled={!currentVariant.variant_id || !currentVariant.percentage}
            onClick={handleAddVariant}
          >
            Add Variant
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
