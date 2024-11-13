"use client";

import { useState } from "react";
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
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InsertLog } from "@web3socialproof/db";

// List of supported Chain IDs from the given source
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

export default function MetricsCreation() {
  const [formData, setFormData] = useState({
    name: "My Metric",
    description: "",
    calculation_type: "count",
  });
  const [variables, setVariables] = useState<InsertLog[]>([]);
  const [currentVariable, setCurrentVariable] = useState<{
    chain_id: number;
    contract_address: string;
    calculation_type: string;
    event_name: string;
    topic_index: number | undefined;
    data_key: string;
    start_block: number;
  }>({
    chain_id: 0,
    contract_address: "",
    event_name: "",
    calculation_type: "count",
    topic_index: undefined,
    data_key: "",
    start_block: 0,
  });
  const router = useRouter();

  const calculationTypes = [
    { value: "count", label: "Count" },
    { value: "sum", label: "Sum" },
    { value: "count_unique", label: "Count Unique" },
  ];

  const topicOptions = [
    { value: "N/A", label: "N/A" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
  ];

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
    });
  };

  const handleDeleteVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleVariableChange = (field: string, value: any) => {
    setCurrentVariable({ ...currentVariable, [field]: value });
  };

  const handleCreateMetric = async () => {
    try {
      const response = await fetch("/dashboard/metrics/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, variables }),
      });

      if (!response.ok) {
        throw new Error("Failed to create metric");
      }

      toast({
        title: "Metric Created",
        description: "Metric created successfully.",
      });
      router.push("/dashboard/metrics"); // Redirect to Metrics Manager
    } catch (error) {
      console.error("Error creating metric:", error);
      toast({
        title: "Error",
        description: "Failed to create metric.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Create Metric</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Metric Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My Metric"
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
                placeholder="Metric description"
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

            <Button className="w-full" onClick={handleCreateMetric}>
              Create Metric
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
                  handleVariableChange("chain_id", value)
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

            <div className="space-y-2">
              <Label>Event Name</Label>
              <Input
                placeholder="Event Name"
                value={currentVariable.event_name}
                onChange={(e) =>
                  handleVariableChange("event_name", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Topic Index</Label>
              <Select
                value={currentVariable.topic_index?.toString() || "N/A"}
                onValueChange={(value) =>
                  handleVariableChange("topic_index", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Topic Index" />
                </SelectTrigger>
                <SelectContent>
                  {topicOptions.map((topic) => (
                    <SelectItem key={topic.value} value={topic.value}>
                      {topic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Key</Label>
              <Input
                placeholder="Data Key"
                value={currentVariable.data_key}
                onChange={(e) =>
                  handleVariableChange("data_key", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Start Block</Label>
              <Input
                placeholder="Start Block"
                type="number"
                value={currentVariable.start_block}
                onChange={(e) =>
                  handleVariableChange(
                    "start_block",
                    parseInt(e.target.value, 10)
                  )
                }
              />
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
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Variables Table</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chain ID</TableHead>
              <TableHead>Contract Address</TableHead>
              <TableHead>Event Name</TableHead>
              <TableHead>Topic Index</TableHead>
              <TableHead>Data Key</TableHead>
              <TableHead>Start Block</TableHead>
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
                <TableCell>{variable.data_key}</TableCell>
                <TableCell>{variable.start_block}</TableCell>
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
      </div>
    </div>
  );
}
