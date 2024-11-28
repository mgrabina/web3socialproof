"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { env } from "@/lib/constants";
import { getTrpcClientForClient } from "@/utils/trpc/client";
import { InsertLog, SelectLog, SelectMetric } from "@web3socialproof/db";
import {
  chains,
  SupportedChainIds,
} from "@web3socialproof/shared/constants/chains";
import { shortenAddress } from "@web3socialproof/shared/utils/evm";
import { useEffect, useState } from "react";
import ContractVerificationDialog from "./ContractOwnershipVerificationDialog";

const calculationTypes = [
  { value: "count", label: "Count" },
  { value: "sum", label: "Sum" },
  // { value: "count_unique", label: "Count Unique" },
];

export default function MetricsForm({
  initialData,
  onSubmit,
}: {
  initialData?: {
    metric: Partial<SelectMetric>;
    variables: Partial<SelectLog>[];
  };
  onSubmit: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState<Partial<SelectMetric> | undefined>(
    initialData?.metric
  );
  const [variables, setVariables] = useState<Partial<SelectLog>[] | undefined>(
    initialData?.variables
  );
  const [abi, setAbi] = useState("");

  useEffect(() => {
    if (initialData && !formData) {
      setFormData(initialData.metric);
      setVariables(initialData.variables);
    }
  }, [initialData, formData]);

  const [currentEvent, setCurrentEvent] = useState<InsertLog>({
    chain_id: 0,
    contract_address: "",
    event_name: "",
    topic_index: undefined,
    calculation_type: "count",
    data_key: "",
    start_block: 0,
  });

  const handleAddEvent = () => {
    setVariables([...(variables ?? []), currentEvent]);
    setCurrentEvent({
      chain_id: 0,
      contract_address: "",
      event_name: "",
      topic_index: undefined,
      calculation_type: "count",
      data_key: "",
      start_block: 0,
    });
  };

  const [isAbiLoading, setIsAbiLoading] = useState(false);

  useEffect(() => {
    if (currentEvent.chain_id && currentEvent.contract_address) {
      setIsAbiLoading(true);
      const fetchAbi = async () => {
        try {
          const abiFromBackend = await (
            await getTrpcClientForClient(env)
          ).contracts.getContractAbi.query({
            chainId: Number(currentEvent.chain_id),
            contractAddress: currentEvent.contract_address,
          });
          setAbi(abiFromBackend ?? "");
          setIsAbiLoading(false);
        } catch (error) {
          console.error("Error fetching ABI:", error);
          setIsAbiLoading(false);
          toast({ title: "Error", description: "Failed to fetch ABI." });
        }
      };
      fetchAbi();
    }
  }, [currentEvent.chain_id, currentEvent.contract_address]);

  const [eventSignatures, setEventSignatures] = useState<string[]>([]);

  const [isContractOwnershipVerified, setIsContractOwnershipVerified] =
    useState(false);

  useEffect(() => {
    if (abi) {
      try {
        const parsedAbi = JSON.parse(abi);

        // Filter for events and construct full signatures
        const events = parsedAbi
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
  }, [abi]);

  const [topics, setTopics] = useState<string[]>([]);
  const [dataFields, setDataFields] = useState<string[]>([]);
  const [isContractOwnershipDialogOpen, setIsContractOwnershipDialogOpen] =
    useState(false);

  useEffect(() => {
    if (abi && currentEvent.event_name) {
      try {
        const parsedAbi = JSON.parse(abi);

        // Find the event matching the selected event name
        const event = parsedAbi.find(
          (item: any) =>
            item.type === "event" &&
            item.name === currentEvent.event_name.split("(")[0]
        );

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
  }, [abi, currentEvent.event_name]);

  const handleDeleteVariable = (index: number) => {
    setVariables(variables?.filter((_, i) => i !== index));
  };

  const handleEventChange = (field: string, value: any) => {
    setCurrentEvent({ ...currentEvent, [field]: value });
  };

  const handleSubmit = async () => {
    await onSubmit({ metric: formData, variables });
  };

  const handleSaveNewAbi = async (abi: string) => {
    if (!currentEvent.chain_id || !currentEvent.contract_address || !abi) {
      return;
    }

    const response = await (
      await getTrpcClientForClient(env)
    ).contracts.saveCustomAbi.mutate({
      chainId: Number(currentEvent.chain_id),
      contractAddress: currentEvent.contract_address,
      abi,
    });

    toast({
      title: "ABI Saved for future use",
      description: "ABI saved successfully.",
    });
  };

  const [isLoading, setIsLoading] = useState(false);

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
              placeholder="Swaps"
              value={formData?.name ?? undefined}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="The amount of swaps made across all chains and pools"
              value={formData?.description ?? undefined}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            {" "}
            <Label htmlFor="description">Events</Label>
            <br />
            <Label className="text-sm text-gray-500">
              A Metric can have multiple events so you can track metric like TVL
              among multiple chains. We will sum the results of all events to
              get the metrics current value.
            </Label>
            <Table
              className="w-full
              border
              rounded-sm
              
              "
            >
              <TableHeader>
                <TableRow>
                  <TableHead>Chain</TableHead>
                  <TableHead>Contract Address</TableHead>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Topic Index</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variables?.map((variable: any, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {chains[variable.chain_id as keyof typeof chains].name}
                    </TableCell>
                    <TableCell>
                      {shortenAddress(variable.contract_address)}
                    </TableCell>
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
                {!variables?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No events added yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
            disabled={isLoading} // Disable button during loading
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
              <>{initialData ? "Update Metric" : "Create Metric"}</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Chain</Label>
            <Select
              value={currentEvent.chain_id.toString()}
              onValueChange={(value) =>
                handleEventChange("chain_id", Number(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Chain ID" />
              </SelectTrigger>
              <SelectContent>
                {SupportedChainIds.toSorted((a, b) => {
                  return chains[a].name.localeCompare(chains[b].name);
                }).map((chain) => (
                  <SelectItem key={chain} value={chain.toString()}>
                    {chains[chain].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="text-sm text-gray-500">
              See supported chains{" "}
              <a
                className="text-blue-500 hover:text-blue-700"
                href="https://docs.envio.dev/docs/HyperSync/hypersync-supported-networks"
                target="_blank"
              >
                here
              </a>
            </label>
          </div>

          <div className="space-y-2">
            <Label>Contract Address</Label>
            <Input
              autoComplete="on"
              placeholder="0x1234..."
              value={currentEvent.contract_address}
              onChange={(e) =>
                handleEventChange("contract_address", e.target.value)
              }
            />
            <div>
              {currentEvent.contract_address &&
                (isContractOwnershipVerified ? (
                  <label className="text-sm text-gray-500">
                    Contract ownership already verified
                  </label>
                ) : (
                  <div
                    onClick={() => setIsContractOwnershipDialogOpen(true)}
                    className="text-sm text-red-400 opacity-75 hover:opacity-100 cursor-pointer hover:text-red-700"
                  >
                    <label>Verify your ownership on this contract</label>
                  </div>
                ))}
              <ContractVerificationDialog
                chainId={1}
                contractAddress={currentEvent.contract_address}
                open={isContractOwnershipDialogOpen}
                setOpen={setIsContractOwnershipDialogOpen}
              />
            </div>

            <label className="text-sm text-gray-500">
              {" "}
              We will try to fetch the ABI from public sources for you{" "}
            </label>
          </div>

          {/* Optional ABI */}
          <div className="space-y-2">
            <Label>
              ABI (Optional)
              <p className="opacity-70"></p>
            </Label>
            <label className="text-sm text-gray-500">
              The ABI (Application Binary Interface) is a representation of what
              functionality and events are available in your smart contracts, we
              use it to help you find the event and fields you want to track.
            </label>
            <Input
              placeholder={`${
                isAbiLoading
                  ? "(Finding in scanners...)"
                  : "[{'type':'event','name':'Swaps','inputs':[{'type':'address','name':'from','indexed':true},{'type':'address','name':'to','indexed':true},{'type':'uint256','name':'amount'}]}]"
              }`}
              disabled={isAbiLoading}
              value={abi}
              onChange={(e) => {
                setAbi(e.target.value);
                handleSaveNewAbi(e.target.value).catch(console.error);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Event Signature</Label>
            {eventSignatures.length > 0 ? (
              <Select
                value={currentEvent.event_name}
                onValueChange={(value) =>
                  setCurrentEvent({
                    ...currentEvent,
                    event_name: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Event Signature" />
                </SelectTrigger>
                <SelectContent>
                  {eventSignatures.map((signature, index) => (
                    <SelectItem key={index} value={signature}>
                      {signature}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Swaps(address,address,uint256)"
                value={currentEvent.event_name}
                onChange={(e) =>
                  setCurrentEvent({
                    ...currentEvent,
                    event_name: e.target.value,
                  })
                }
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Topic or Data Field</Label>
            <br />
            <label className="text-sm text-gray-500">
              Topics are highlighted parameters in the events, data fields are
              standard parameters.
            </label>
            {eventSignatures.length > 0 ||
            topics.length > 0 ||
            dataFields.length > 0 ? (
              // Single combined select if topics or data fields are available
              <Select
                value={
                  currentEvent.topic_index !== undefined
                    ? `Topic: ${topics[currentEvent.topic_index ?? 1]}`
                    : currentEvent.data_key ?? undefined
                }
                onValueChange={(value) => {
                  // Determine if the selection is a topic or data field
                  if (value.startsWith("Topic:")) {
                    const topicIndex = topics.findIndex(
                      (topic) => `Topic: ${topic}` === value
                    );
                    handleEventChange("topic_index", topicIndex);
                    handleEventChange("data_key", undefined); // Clear data field
                  } else {
                    handleEventChange("data_key", value);
                    handleEventChange("topic_index", undefined); // Clear topic
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Topic or Data Field" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic, index) => (
                    <SelectItem
                      key={`topic-${index}`}
                      value={`Topic: ${topic}`}
                    >
                      Topic: {topic}
                    </SelectItem>
                  ))}
                  {dataFields.map((field, index) => (
                    <SelectItem key={`data-${index}`} value={field}>
                      Data Field: {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              // Tabs with selects for topics and a text input for data fields
              <Tabs defaultValue="topics">
                <TabsList>
                  <TabsTrigger value="topics">Topics</TabsTrigger>
                  <TabsTrigger value="data">Data Fields</TabsTrigger>
                </TabsList>

                <TabsContent value="topics">
                  <Label>Topic</Label>
                  <Select
                    value={currentEvent.topic_index?.toString() || undefined}
                    onValueChange={(value) => {
                      handleEventChange("topic_index", Number(value));
                      handleEventChange("data_key", undefined); // Clear data field
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3].map((topicIndex) => (
                        <SelectItem
                          key={topicIndex}
                          value={topicIndex.toString()}
                        >
                          Topic {topicIndex}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>

                <TabsContent value="data">
                  <Label>Data Field</Label>
                  <Input
                    placeholder="Custom Data Field"
                    value={currentEvent.data_key ?? undefined}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleEventChange("data_key", value);
                      handleEventChange("topic_index", undefined); // Clear topic
                    }}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>

          <div className="space-y-2">
            <Label>Calculation Type</Label>
            <br />
            <label className="text-sm text-gray-500">
              Choose how we should aggregate the results of this event
            </label>
            <Select
              value={currentEvent?.calculation_type ?? undefined}
              onValueChange={(value) => {
                setCurrentEvent({
                  ...currentEvent,
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

          <Button
            className="w-full mt-4"
            variant="default"
            onClick={handleAddEvent}
          >
            Add Event
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
