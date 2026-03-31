import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { type Alert } from '../data/farmData';
import { AlertTriangle, Bell, CheckCircle, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFarmData } from '../contexts/FarmDataContext';
import { Label } from '../components/ui/label'; // Added missing import for Label

export default function FarmAlerts({ zoneId }: { zoneId?: string }) {
  const { user } = useAuth();
  const { alerts, setAlerts: setAlertList } = useFarmData(); // Get raw alerts and setter from context

  // Filter alerts based on user permissions and zoneId
  const visibleAlerts = useMemo(() => {
    let filtered = user?.user_type === 'admin'
      ? alerts
      : alerts.filter(alert => canAccessZone(alert.zoneId));

    return zoneId ? filtered.filter(a => a.zoneId === zoneId) : filtered;
  }, [user, alerts, zoneId, canAccessZone]);
  
  const [statusFilter, setStatusFilter] = useState<'All' | 'Acknowledged' | 'Unacknowledged'>('Unacknowledged');

  const handleAcknowledge = (id: string) => {
    setAlertList(
      alerts.map((alert) =>
        alert.id === id
          ? { ...alert, acknowledged: true, acknowledgedBy: user?.name, acknowledgedAt: new Date().toISOString() }
          : alert
      )
    );
  };

  // Filter alerts based on status
  const filteredAlerts = visibleAlerts.filter((alert) => {
    if (statusFilter !== 'All') {
      if (statusFilter === 'Acknowledged' && !alert.acknowledged) return false;
      if (statusFilter === 'Unacknowledged' && alert.acknowledged) return false;
    }
    return true;
  });

  const unacknowledgedCount = visibleAlerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-6">
      {!zoneId && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Cảnh báo</h2>
            <p className="text-gray-600">Theo dõi và quản lý các cảnh báo</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-sm font-medium text-red-700">
                {unacknowledgedCount} Cảnh báo chưa xử lý
              </span>
            </div>
          </div>
        </div>
      )}
      
      {zoneId && unacknowledgedCount > 0 && (
        <div className="flex justify-start">
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-sm font-medium text-red-700">
              {unacknowledgedCount} Cảnh báo chưa xử lý
            </span>
          </div>
        </div>
      )}

      {/* Alert Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chưa xác nhận</p>
                <p className="text-3xl font-bold mt-1">{unacknowledgedCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng cảnh báo</p>
                <p className="text-3xl font-bold mt-1">{visibleAlerts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle>Bộ lọc cảnh báo</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="mb-2 block">Trạng thái</Label>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Tất cả</SelectItem>
                  <SelectItem value="Acknowledged">Đã xác nhận</SelectItem>
                  <SelectItem value="Unacknowledged">Chưa xác nhận</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách thông báo</CardTitle>
            <Badge variant="outline">{filteredAlerts.length} cảnh báo</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg ${
                  alert.acknowledged ? 'bg-gray-50 opacity-70' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className="w-5 h-5 mt-0.5 text-orange-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="destructive">
                          Cảnh báo
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString('vi-VN')}
                        </span>
                        {alert.acknowledged && (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Đã xác nhận
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium mb-1">{alert.message}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{alert.zoneName}</span>
                        {alert.deviceName && (
                          <>
                            <span>•</span>
                            <span>{alert.deviceName}</span>
                          </>
                        )}
                      </div>
                      {alert.acknowledged && alert.acknowledgedBy && (
                        <p className="text-xs text-gray-500 mt-1">
                          Xác nhận bởi {alert.acknowledgedBy} lúc {new Date(alert.acknowledgedAt!).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      Xác nhận
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}