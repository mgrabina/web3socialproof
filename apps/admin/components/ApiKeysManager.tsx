"use client";

import { useState, useEffect } from "react";
import { Trash2, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { apiKeyTable, db } from "@web3socialproof/db";
import { eq, SelectApiKey } from "@web3socialproof/db";

export default function SaasApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<SelectApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state for table

  // Fetch API keys from the server
  useEffect(() => {
    async function fetchApiKeys() {
      setIsLoading(true); // Start loading
      const response = await fetch("/api-keys/api");
      const keys = await response.json();
      setApiKeys(keys);
      setIsLoading(false); // End loading
    }
    fetchApiKeys();
  }, []);

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
      setApiKeys((prevKeys) => [...prevKeys, newKey]);
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
    `<script\n  src="https://pixel.gobyherd.com/static/script.min.js?apiKey=${apiKey}"\n  async\n></script>`;

  const integrationSnippet = apiKeys.length
    ? getIntegrationCode(apiKeys[0].api_key)
    : "<script src='https://pixel.gobyherd.com/static/script.min.js?apiKey=YOUR_API_KEY' async></script>";

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">API Keys</h1>
      </div>

      {/* API Keys Card */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading...</span>
            </div>
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
                {apiKeys.map((key) => (
                  <TableRow key={key.api_key}>
                    <TableCell>{key.name}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {key.api_key.slice(0, 10)}...{key.api_key.slice(-4)}
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
                        onClick={() => handleCopyKey(key.api_key)}
                      >
                        <Copy className="h-4 w-4" />
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
      <Card className="w-full max-w-4xl mx-auto border border-gray-200 shadow-md">
        <CardHeader className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Integration Guide
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => handleCopyKey(integrationSnippet)}
              className="hover:bg-gray-100"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            To integrate your API key, add the following snippet to the{" "}
            <code className="font-mono text-blue-600">&lt;head&gt;</code> of
            your HTML file.
            <br /> Replace{" "}
            <code className="font-mono text-blue-600">apiKey</code> with any of
            your API keys.
          </p>
          <div className="rounded-md overflow-hidden shadow-inner">
            <SyntaxHighlighter
              language="html"
              style={docco}
              showLineNumbers
              lineNumberStyle={{ color: "#999" }}
              className="text-sm"
            >
              {integrationSnippet}
            </SyntaxHighlighter>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
