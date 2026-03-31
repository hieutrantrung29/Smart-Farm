import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { type ActivityLog } from '../data/farmData';
import { History, User, Settings, Calendar, Filter, Shield, MapPin, HardDrive } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFarmData } from '../contexts/FarmDataContext';

export function ActivityHistory() {
  const { user } = useAuth();
  const { activityLogs } = useFarmData();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  // Filter logs based on permissions and filters
  const filteredLogs = activityLogs.filter(log => {
    // Permission check
    if (user?.role === 'Operator') {
      if (log.zoneId && !user.assignedZones?.includes(log.zoneId)) {
        return false;
      }
    }

    // Type filter
    if (filterType !== 'all' && log.targetType !== filterType) {
      return false;
    }

    // User filter
    if (filterUser !== 'all' && log.userId !== filterUser) {
      return false;
    }

    // Action filter
    if (filterAction !== 'all' && log.action !== filterAction) {
      return false;
    }

    return true;
  });

  const uniqueUsers = Array.from(new Set(activityLogs.map(log => log.userId))).map(userId => {
    const log = activityLogs.find(l => l.userId === userId);
    return { id: userId, name: log?.userName || '' };
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Create':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Assign':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Control':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: ActivityLog['targetType']) => {
    switch (type) {
      case 'Threshold':
        return <Settings className="w-4 h-4" />;
      case 'Schedule':
        return <Calendar className="w-4 h-4" />;
      case 'Zone Assignment':
        return <User className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lịch sử hoạt động</h1>
        <p className="text-gray-500 mt-1">
          {user?.role === 'Admin'
            ? 'Xem tất cả hoạt động và thay đổi trong hệ thống'
            : 'Xem hoạt động trong các khu vực được gán'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng hoạt động</p>
              <p className="text-3xl font-bold mt-1">{activityLogs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Đã lọc</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{filteredLogs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Người dùng</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{uniqueUsers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Hôm nay</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {activityLogs.filter(log => log.timestamp.includes('Just now') || log.timestamp.includes('minutes ago') || log.timestamp.includes('hour ago')).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại hoạt động</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="Threshold">Ngưỡng</SelectItem>
                  <SelectItem value="Schedule">Lịch trình</SelectItem>
                  <SelectItem value="Device">Thiết bị</SelectItem>
                  <SelectItem value="Zone Assignment">Phân công khu vực</SelectItem>
                  <SelectItem value="User">Người dùng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Người dùng</label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả người dùng</SelectItem>
                  {uniqueUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hành động</label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả hành động</SelectItem>
                  <SelectItem value="Create">Tạo mới</SelectItem>
                  <SelectItem value="Update">Cập nhật</SelectItem>
                  <SelectItem value="Delete">Xóa</SelectItem>
                  <SelectItem value="Assign">Phân công</SelectItem>
                  <SelectItem value="Control">Điều khiển</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Nhật ký hoạt động ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Không tìm thấy hoạt động nào</p>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    {getTypeIcon(log.targetType)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium">{log.targetName}</p>
                          <Badge variant="outline" className="text-xs">
                            {log.targetType === 'Threshold' ? 'Ngưỡng' :
                             log.targetType === 'Schedule' ? 'Lịch trình' :
                             log.targetType === 'Device' ? 'Thiết bị' :
                             log.targetType === 'Zone Assignment' ? 'Phân công' : 'Người dùng'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{log.changes}</p>
                        <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                          {log.zoneName && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {log.zoneName}
                            </span>
                          )}
                          {log.deviceName && (
                            <span className="flex items-center gap-1">
                              <HardDrive className="w-3 h-3" />
                              {log.deviceName}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getActionColor(log.action)}`}>
                        {log.action === 'Create' ? 'Tạo' :
                         log.action === 'Update' ? 'Sửa' :
                         log.action === 'Delete' ? 'Xóa' :
                         log.action === 'Assign' ? 'Gán' : 'Điều khiển'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap text-xs text-gray-400 pt-2 border-t">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="font-medium">{log.userName}</span>
                        <Badge variant="outline" className="text-xs ml-1">
                          <Shield className="w-2 h-2 mr-1" />
                          {log.userRole}
                        </Badge>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {typeof log.timestamp === 'string' && log.timestamp.includes('2024')
                          ? new Date(log.timestamp).toLocaleString('vi-VN')
                          : log.timestamp}
                      </span>
                      {log.ipAddress && (
                        <span className="flex items-center gap-1 text-gray-400">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          {log.ipAddress}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
