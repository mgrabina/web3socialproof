"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, RefreshCw, Trash } from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "@/hooks/use-toast";
import { useUserContext } from "@/lib/context/useUserContext";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { SelectApiKey } from "@web3socialproof/db";
import IntegrationGuide from "./IntegrationGuide";
import { LoadingTable } from "./LoadingTable";

export default function SaasApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<SelectApiKey[] | null>();
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state for table
  const supabase = createSupabaseClientForClientSide();
  const { protocol } = useUserContext();

  // Fetch API keys from the server
  useEffect(() => {
    async function fetchApiKeys() {
      setIsLoading(true); // Start loading

      if (!protocol?.id) {
        throw new Error("No protocol found.");
      }

      // Fetch API keys
      const { data, error } = await supabase
        .from("api_key_table")
        .select()
        .eq("protocol_id", protocol?.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch API keys.",
          variant: "destructive",
        });
        return;
      }

      setApiKeys(data);

      setIsLoading(false); // End loading
    }

    if (!protocol) {
      return;
    }

    fetchApiKeys();
  }, [protocol, supabase]);

  const handleCreateKey = async () => {
    if (newKeyName.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a name for the new API key.",
        variant: "destructive",
      });
      return;
    }
    setIsCreatingKey(true);
    try {
      const response = await fetch("/api-keys/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName, protocol_id: 1 }), // Replace protocol_id as needed
      });
      const newKey = await response.json();
      setApiKeys((prevKeys) => [...(prevKeys ?? []), newKey]);
      setNewKeyName("");
      toast({
        title: "API Key Created",
        description: "Your new API key has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleCopyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "The content has been copied to your clipboard.",
    });
  };

  const getIntegrationCode = (apiKey: string) =>
    `<script\n  src="https://pixel.gobyherd.com?apiKey=${apiKey}"\n  defer\n></script>`;

  const integrationSnippet = apiKeys?.length
    ? getIntegrationCode(apiKeys[0].key)
    : "<script src='https://pixel.gobyherd.com?apiKey=YOUR_API_KEY' defer></script>";

  const handleDeleteKey = async (key: string) => {
    const { error } = await supabase
      .from("api_key_table")
      .delete()
      .eq("key", key);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key.",
        variant: "destructive",
      });
      return;
    }

    setApiKeys((prevKeys) => prevKeys?.filter((k) => k.key !== key));
    toast({
      title: "Success!",
      description: "API key deleted successfully.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">API Keys</h1>
      </div>

      {/* API Keys Card */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="mt-4">
          {isLoading ? (
            <LoadingTable />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys?.map((key) => (
                  <TableRow key={key.key}>
                    <TableCell>{key.name}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {key.key.slice(0, 10)}...{key.key.slice(-4)}
                      </code>
                    </TableCell>
                    <TableCell>
                      {new Date(key.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyKey(key.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteKey(key.key)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateKey();
            }}
            className="flex w-full space-x-2"
          >
            <Input
              placeholder="Enter new API key name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <Button type="submit" disabled={isCreatingKey}>
              {isCreatingKey ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create New Key"
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>

      {/* Integration Guide Card */}
      <IntegrationGuide />
    </div>
  );
}
