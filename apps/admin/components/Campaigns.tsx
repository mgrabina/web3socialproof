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
import { SelectCampaign } from "@web3socialproof/db";
import { Edit, Pause, Play, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingTable } from "./LoadingTable";

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<SelectCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchCampaigns() {
      setIsLoading(true);
      try {
        const response = await fetch("/campaigns/api");
        const data = await response.json();

        if (response.ok) setCampaigns(data);
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
      await fetch(`/campaigns/api/${campaignId}`, {
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

  const handleToggleCampaignStatus = async (campaign: SelectCampaign) => {
    try {
      const updatedCampaign = { ...campaign, enabled: !campaign.enabled };
      await fetch(`/campaigns/api/${campaign.id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCampaign),
      });
      setCampaigns((prevCampaigns) =>
        prevCampaigns?.map((c) => (c.id === campaign.id ? updatedCampaign : c))
      );
      toast({
        title: `Campaign ${campaign.enabled ? "Paused" : "Activated"}`,
        description: `Campaign "${campaign.name}" has been ${
          campaign.enabled ? "paused" : "activated"
        }.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update campaign status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <a href="/campaigns/create">
          <Button className="gap-2">Create Campaign</Button>
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
                {campaigns?.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>
                      {campaign.enabled ? "Active" : "Paused"}
                    </TableCell>
                    <TableCell>{campaign.type}</TableCell>
                    <TableCell>
                      {new Date(campaign.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right flex space-x-2 justify-end">
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/campaigns/${campaign.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* Pause/Resume Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleCampaignStatus(campaign)}
                      >
                        {campaign.enabled ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      {/* Delete Button */}
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
