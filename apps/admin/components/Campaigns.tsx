"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Trash2, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { campaignsTable, SelectCampaign } from "@web3socialproof/db";

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<SelectCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      setIsLoading(true);
      try {
        const response = await fetch("/dashboard/campaigns/api");
        const data = await response.json();
        setCampaigns(data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const handleDeleteCampaign = async (campaignId: number) => {
    try {
      await fetch(`/dashboard/campaigns/api/${campaignId}`, {
        method: "DELETE",
      });
      setCampaigns(campaigns.filter((c) => c.id !== campaignId));
      toast({
        title: "Campaign Deleted",
        description: "Campaign deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <a href="/dashboard/campaigns/create">
          <Button className="gap-2">Create Campaign</Button>
        </a>
      </div>

      <Card>
        <CardContent>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Creation Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{campaign.enabled ? "Active" : "Paused"}</TableCell>
                    <TableCell>{campaign.type}</TableCell>
                    <TableCell>{campaign.created_at.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {/* <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button> */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
