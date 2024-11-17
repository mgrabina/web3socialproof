"use client";

import { useEffect, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useTrpcBackend } from "@/hooks/useTrpcBackend";
import { getTrpcClientForClient } from "@/utils/trpc/client";
import { env } from "@/lib/constants";

const supportedChainIds = [
  { value: "1", label: "Ethereum Mainnet" },
  { value: "56", label: "Binance Smart Chain" },
  { value: "137", label: "Polygon Mainnet" },
  { value: "43114", label: "Avalanche C-Chain" },
  { value: "42161", label: "Arbitrum One" },
  { value: "10", label: "Optimism Mainnet" },
  { value: "250", label: "Fantom Opera" },
  { value: "100", label: "Gnosis Chain (xDai)" },
];

const calculationTypes = [
  { value: "count", label: "Count" },
  { value: "sum", label: "Sum" },
  // { value: "count_unique", label: "Count Unique" },
];

const topicOptions = [
  { value: "N/A", label: "N/A" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
];

export default function MetricsForm({
  initialData,
  onSubmit,
}: {
  initialData?: {
    name: string;
    description: string;
    calculation_type: string;
    variables: any[];
  };
  onSubmit: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      description: "",
      calculation_type: "count",
    }
  );
  const [variables, setVariables] = useState(initialData?.variables || []);
  const [currentVariable, setCurrentVariable] = useState({
    chain_id: 0,
    contract_address: "",
    event_name: "",
    topic_index: undefined,
    calculation_type: "count",
    data_key: "",
    start_block: 0,
    abi: "",
  });

  const handleAddVariable = () => {
    setVariables([...variables, currentVariable]);
    setCurrentVariable({
      chain_id: 0,
      contract_address: "",
      event_name: "",
      topic_index: undefined,
      calculation_type: "count",
      data_key: "",
      start_block: 0,
      abi: "",
    });
  };

  const [isAbiLoading, setIsAbiLoading] = useState(false);

  useEffect(() => {
    if (currentVariable.chain_id && currentVariable.contract_address) {
      setIsAbiLoading(true);
      const fetchAbi = async () => {
        try {
          const abiFromBackend = await (
            await getTrpcClientForClient(env)
          ).contracts.getContractAbi.query({
            chainId: Number(currentVariable.chain_id),
            contractAddress: currentVariable.contract_address,
          });
          setCurrentVariable((prev) => ({
            ...prev,
            abi: abiFromBackend ?? "",
          }));
          setIsAbiLoading(false);
        } catch (error) {
          console.error("Error fetching ABI:", error);
          setIsAbiLoading(false);
          toast({ title: "Error", description: "Failed to fetch ABI." });
        }
      };
      fetchAbi();
    }
  }, [currentVariable.chain_id, currentVariable.contract_address]);

  const [eventSignatures, setEventSignatures] = useState<string[]>([]);

  useEffect(() => {
    if (currentVariable.abi) {
      try {
        const abi = JSON.parse(currentVariable.abi);

        // Filter for events and construct full signatures
        const events = abi
          .filter((item: any) => item.type === "event")
          .map((item: any) => {
            const inputs = item.inputs
              .map((input: any) => input.type) // Extract types
              .join(","); // Join types with commas
            return `${item.name}(${inputs})`; // Construct the full event signature
          });

        setEventSignatures(events); // Save full event signatures
      } catch (error) {
        console.error("Error parsing ABI:", error);
        toast({ title: "Error", description: "Invalid ABI format." });
      }
    }
  }, [currentVariable.abi]);

  const [topics, setTopics] = useState<string[]>([]);
  const [dataFields, setDataFields] = useState<string[]>([]);

  console.log("topics", topics);
  console.log("dataFields", dataFields);

  useEffect(() => {
    console.log("currentVariable event", currentVariable.event_name);

    if (currentVariable.abi && currentVariable.event_name) {
      try {
        const abi = JSON.parse(currentVariable.abi);

        // Find the event matching the selected event name
        const event = abi.find(
          (item: any) =>
            item.type === "event" && item.name === currentVariable.event_name.split("(")[0]
        );

        console.log("event", event);
        if (event) {
          // Extract indexed parameters as topics
          const indexedParams = event.inputs
            .filter((input: any) => input.indexed)
            .map((input: any) => `${input.name} (${input.type})`);

          // Extract non-indexed parameters as data fields
          const nonIndexedParams = event.inputs
            .filter((input: any) => !input.indexed)
            .map((input: any) => `${input.name} (${input.type})`);

          setTopics(indexedParams);
          setDataFields(nonIndexedParams);
        } else {
          setTopics([]);
          setDataFields([]);
        }
      } catch (error) {
        console.error("Error parsing ABI:", error);
        toast({
          title: "Error",
          description: "Invalid ABI format or missing event.",
        });
      }
    }
  }, [currentVariable.abi, currentVariable.event_name]);

  const handleDeleteVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleVariableChange = (field: string, value: any) => {
    setCurrentVariable({ ...currentVariable, [field]: value });
  };

  const handleSubmit = async () => {
    await onSubmit({ ...formData, variables });
  };

  const handleSaveNewAbi = async (abi: string) => {
    if (
      !currentVariable.chain_id ||
      !currentVariable.contract_address ||
      !abi
    ) {
      return;
    }

    const response = await (
      await getTrpcClientForClient(env)
    ).contracts.saveCustomAbi.mutate({
      chainId: Number(currentVariable.chain_id),
      contractAddress: currentVariable.contract_address,
      abi,
    });

    toast({
      title: "ABI Saved for future use",
      description: "ABI saved successfully.",
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Metric Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Metric Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Metric Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Calculation Type</Label>
            <Select
              value={formData.calculation_type}
              onValueChange={(value) => {
                setFormData({ ...formData, calculation_type: value });
                setCurrentVariable({
                  ...currentVariable,
                  calculation_type: value,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select calculation type" />
              </SelectTrigger>
              <SelectContent>
                {calculationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" onClick={handleSubmit}>
            {initialData ? "Update Metric" : "Create Metric"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Variable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Chain ID</Label>
            <Select
              value={currentVariable.chain_id.toString()}
              onValueChange={(value) =>
                handleVariableChange("chain_id", Number(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Chain ID" />
              </SelectTrigger>
              <SelectContent>
                {supportedChainIds.map((chain) => (
                  <SelectItem key={chain.value} value={chain.value}>
                    {chain.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Contract Address</Label>
            <Input
              placeholder="Contract Address"
              value={currentVariable.contract_address}
              onChange={(e) =>
                handleVariableChange("contract_address", e.target.value)
              }
            />
          </div>

          {/* Optional ABI */}
          <div className="space-y-2">
            <Label>
              ABI{" "}
              <p className="opacity-70">
                {isAbiLoading ? "(Finding in scanners...)" : ""}
              </p>
            </Label>
            <Input
              placeholder="ABI"
              disabled={isAbiLoading}
              value={currentVariable.abi}
              onChange={(e) => {
                setCurrentVariable({ ...currentVariable, abi: e.target.value });
                handleSaveNewAbi(e.target.value).catch(console.error);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Event Signature</Label>
            <Input
              placeholder="Event Signature"
              value={currentVariable.event_name}
              list="event-signatures-list"
              onChange={(e) =>
                setCurrentVariable({
                  ...currentVariable,
                  event_name: e.target.value,
                })
              }
            />
            <datalist id="event-signatures-list">
              {eventSignatures.map((signature) => (
                <option key={signature} value={signature} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label>Topic</Label>
            <Select
              value={currentVariable.topic_index || "N/A"}
              onValueChange={(value) =>
                handleVariableChange("topic_index", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data Field</Label>
            <Select
              value={currentVariable.data_key || "N/A"}
              onValueChange={(value) => handleVariableChange("data_key", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Data Field" />
              </SelectTrigger>
              <SelectContent>
                {dataFields.map((field, index) => (
                  <SelectItem key={index} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full mt-4"
            variant="secondary"
            onClick={handleAddVariable}
          >
            Add Variable
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-8 md:col-span-2">
        <CardHeader>
          <CardTitle>Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chain ID</TableHead>
                <TableHead>Contract Address</TableHead>
                <TableHead>Event Name</TableHead>
                <TableHead>Topic Index</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variables.map((variable: any, index) => (
                <TableRow key={index}>
                  <TableCell>{variable.chain_id}</TableCell>
                  <TableCell>{variable.contract_address}</TableCell>
                  <TableCell>{variable.event_name}</TableCell>
                  <TableCell>{variable.topic_index}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteVariable(index)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
