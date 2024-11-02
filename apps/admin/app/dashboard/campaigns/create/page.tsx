'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Flame, Users, Wallet, BadgeCheck, ShieldCheck } from "lucide-react"
import { useState } from "react"

export default function Component() {
  const [formData, setFormData] = useState({
    origins: '',
    type: 'swaps',
    mainText: '537 Swaps',
    subText: '4504 in the last month'
  })

  const notificationTypes = [
    { value: 'swaps', label: 'Swaps', icon: Flame },
    { value: 'wallets', label: 'Wallets Connected', icon: Wallet },
    { value: 'tvl', label: 'TVL', icon: Users },
    { value: 'audits', label: 'Audits', icon: ShieldCheck },
  ]

  const getIcon = () => {
    const type = notificationTypes.find(t => t.value === formData.type)
    const Icon = type?.icon || Flame
    return <Icon className="h-6 w-6" />
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Create Campaign</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="origins">Allowed Origins</Label>
              <Input
                id="origins"
                placeholder="https://example.com"
                value={formData.origins}
                onChange={(e) => setFormData({ ...formData, origins: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Enter the domains where this notification will appear
              </p>
            </div>

            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainText">Main Text</Label>
              <Input
                id="mainText"
                placeholder="537 Swaps made today"
                value={formData.mainText}
                onChange={(e) => setFormData({ ...formData, mainText: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subText">Sub Text</Label>
              <Input
                id="subText"
                placeholder="4504 in the last month"
                value={formData.subText}
                onChange={(e) => setFormData({ ...formData, subText: e.target.value })}
              />
            </div>

            <Button className="w-full">Create Campaign</Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card style={{
          border: "0",
          boxShadow: "none"
        }}>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-full shadow-lg p-4">
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-4 ${
                  formData.type === 'swaps' ? 'bg-red-50' :
                  formData.type === 'wallets' ? 'bg-blue-50' :
                  formData.type === 'tvl' ? 'bg-green-50' :
                  'bg-purple-50'
                }`}>
                  <div className={`${
                    formData.type === 'swaps' ? 'text-red-500' :
                    formData.type === 'wallets' ? 'text-blue-500' :
                    formData.type === 'tvl' ? 'text-green-500' :
                    'text-purple-500'
                  }`}>
                    {getIcon()}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xl font-semibold">
                    {formData.mainText}
                  </div>
                  <div className="text-gray-500">
                    {formData.subText}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-blue-500">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="text-sm">
                      Verified <span className="underline">on-chain</span> by Talaria
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}