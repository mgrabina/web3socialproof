"use client";

import { useState, useEffect } from "react";
import { Trash2, Copy, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { eq, InsertApiKey, SelectApiKey } from "@web3socialproof/db";

export default function SaasApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<SelectApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [keyToDelete, setKeyToDelete] = useState<SelectApiKey | null>(null);
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

  const handleDeleteKey = async (key: SelectApiKey) => {
    try {
      await fetch(`/api-keys/api/${key.api_key}`, {
        method: "DELETE",
      });
      setApiKeys(apiKeys.filter((k) => k.api_key !== key.api_key));
      setKeyToDelete(null);
      toast({
        title: "API Key Deleted",
        description: "The API key has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "API Key Copied",
      description: "The API key has been copied to your clipboard.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">API Keys</h1>
      </div>

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
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopyKey(key.api_key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete API Key</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this API key?
                                This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="secondary"
                                onClick={() => setKeyToDelete(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteKey(key)}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
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
    </div>
  );
}
