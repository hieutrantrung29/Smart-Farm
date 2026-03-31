import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { zones, thresholds } from '../data/farmData';
import { Bell, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ThresholdSettings() {
  const { user } = useAuth();
  const [selectedZone, setSelectedZone] = useState('all');

  const filteredThresholds = selectedZone === 'all'
    ? thresholds
    : thresholds.filter((t) => t.zoneId === selectedZone);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Threshold Settings</h2>
          <p className="text-gray-600">Configure environmental thresholds and alerts</p>
        </div>
        {user?.role === 'Admin' && (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Threshold
          </Button>
        )}
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            Advanced threshold configuration and custom alert rules are currently under development.
          </p>
          <Badge variant="secondary" className="text-sm">
            Expected Release: Q2 2026
          </Badge>
        </CardContent>
      </Card>

      {/* Zone Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by Zone:</label>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Current Thresholds (Preview) */}
      <Card>
        <CardHeader>
          <CardTitle>Current Thresholds (Preview Only)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredThresholds.map((threshold) => (
              <div
                key={threshold.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white opacity-60"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{threshold.parameter}</p>
                    <p className="text-sm text-gray-600">{threshold.zoneName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Min</p>
                      <p className="font-semibold">
                        {threshold.min} {threshold.unit}
                      </p>
                    </div>
                    <div className="text-center text-gray-400">—</div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Max</p>
                      <p className="font-semibold">
                        {threshold.max} {threshold.unit}
                      </p>
                    </div>
                  </div>
                </div>
                {user?.role === 'Admin' && (
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" disabled>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" disabled>
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Configuration (Disabled) */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 opacity-60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email Notifications</label>
                <Input
                  type="email"
                  placeholder="admin@smartfarm.com"
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">SMS Notifications</label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notification Frequency</label>
              <Select disabled>
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Immediate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {user?.role === 'Admin' && (
              <Button className="gap-2" disabled>
                <Save className="w-4 h-4" />
                Save Settings
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
