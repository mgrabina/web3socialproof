"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, Plus, Search } from "lucide-react";

export default function Campaigns() {
  // This would typically come from an API or state management
  const campaigns = [
    {
      id: 1,
      name: "Welcome Message",
      status: "Active",
      notifications: 1234,
      conversionRate: "2.5%",
    },
    {
      id: 2,
      name: "NFT Drop Reminder",
      status: "Scheduled",
      notifications: 567,
      conversionRate: "3.1%",
    },
    {
      id: 3,
      name: "Token Sale Alert",
      status: "Inactive",
      notifications: 890,
      conversionRate: "1.8%",
    },
    {
      id: 4,
      name: "Community Update",
      status: "Active",
      notifications: 2345,
      conversionRate: "4.2%",
    },
    {
      id: 5,
      name: "Governance Vote",
      status: "Active",
      notifications: 678,
      conversionRate: "2.9%",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <a href="/dashboard/campaigns/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search campaigns" className="pl-8" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notifications Sent</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "Inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {campaign.notifications.toLocaleString()}
                  </TableCell>
                  <TableCell>{campaign.conversionRate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
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
