import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { scheduleExecutions, type Schedule, type ActivityLog, type ScheduleExecution } from '../data/farmData';
import { Calendar, Clock, Plus, Edit, Trash2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFarmData } from '../contexts/FarmDataContext';

export default function Scheduling({ zoneId }: { zoneId?: string }) {
  const { user, canEditZone } = useAuth();
  const { schedules: scheduleList, setSchedules: setScheduleList, activityLogs, setActivityLogs, zones } = useFarmData();
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAction, setEditAction] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editFrequency, setEditFrequency] = useState<'Daily' | 'Weekly' | 'Custom'>('Daily');

  // New schedule form state
  const [newName, setNewName] = useState('');
  const [newZoneId, setNewZoneId] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newFrequency, setNewFrequency] = useState<'Daily' | 'Weekly' | 'Custom'>('Daily');

  // Filter schedules based on user permissions
  const initialFilteredSchedules = user?.role === 'Admin' 
    ? scheduleList 
    : scheduleList.filter(s => user?.assignedZones?.includes(s.zoneId));
    
  const filteredSchedules = zoneId
    ? initialFilteredSchedules.filter(s => s.zoneId === zoneId)
    : initialFilteredSchedules;

  const handleToggle = (id: string) => {
    const schedule = scheduleList.find(s => s.id === id);
    if (!schedule) return;

    if (!canEditZone(schedule.zoneId)) {
      alert('You do not have permission to modify schedules in this zone.');
      return;
    }

    const updatedSchedules = scheduleList.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );

    // Add activity log
    const newLog: ActivityLog = {
      id: `al${Date.now()}`,
      userId: user?.id || '',
      userName: user?.name || '',
      userRole: user?.role || 'Operator',
      action: 'Update',
      targetType: 'Schedule',
      targetId: schedule.id,
      targetName: schedule.name,
      zoneId: schedule.zoneId,
      zoneName: schedule.zoneName,
      changes: schedule.enabled ? 'Disabled schedule' : 'Enabled schedule',
      timestamp: 'Just now',
    };

    setScheduleList(updatedSchedules);
    setActivityLogs([newLog, ...activityLogs]);
  };

  const handleEdit = (schedule: Schedule) => {
    if (!canEditZone(schedule.zoneId)) {
      alert('You do not have permission to edit schedules in this zone.');
      return;
    }
    setEditingSchedule(schedule);
    setEditName(schedule.name);
    setEditAction(schedule.action);
    setEditStartTime(schedule.startTime);
    setEditEndTime(schedule.endTime);
    setEditFrequency(schedule.frequency);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingSchedule) return;

    const updatedSchedules = scheduleList.map(s =>
      s.id === editingSchedule.id
        ? { ...s, name: editName, action: editAction, startTime: editStartTime, endTime: editEndTime, frequency: editFrequency }
        : s
    );

    // Add activity log
    const newLog: ActivityLog = {
      id: `al${Date.now()}`,
      userId: user?.id || '',
      userName: user?.name || '',
      userRole: user?.role || 'Operator',
      action: 'Update',
      targetType: 'Schedule',
      targetId: editingSchedule.id,
      targetName: editName,
      zoneId: editingSchedule.zoneId,
      zoneName: editingSchedule.zoneName,
      changes: `Tần suất: ${editFrequency}, Thời gian: ${editStartTime} - ${editEndTime}`,
      timestamp: 'Just now',
    };

    setScheduleList(updatedSchedules);
    setActivityLogs([newLog, ...activityLogs]);
    setIsDialogOpen(false);
    setEditingSchedule(null);
  };

  const handleAdd = () => {
    if (!newName || !newZoneId || !newAction || !newStartTime || !newEndTime) {
      alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const newSchedule: Schedule = {
      id: `s${Date.now()}`,
      name: newName,
      zoneId: newZoneId,
      zoneName: zones.find(z => z.id === newZoneId)?.name || '',
      action: newAction,
      startTime: newStartTime,
      endTime: newEndTime,
      frequency: newFrequency,
      enabled: true,
    };

    const updatedSchedules = [...scheduleList, newSchedule];

    // Add activity log
    const newLog: ActivityLog = {
      id: `al${Date.now()}`,
      userId: user?.id || '',
      userName: user?.name || '',
      userRole: user?.role || 'Operator',
      action: 'Create',
      targetType: 'Schedule',
      targetId: newSchedule.id,
      targetName: newSchedule.name,
      zoneId: newSchedule.zoneId,
      zoneName: newSchedule.zoneName,
      changes: `Tần suất: ${newFrequency}, Thời gian: ${newStartTime} - ${newEndTime}`,
      timestamp: 'Just now',
    };

    setScheduleList(updatedSchedules);
    setActivityLogs([newLog, ...activityLogs]);
    setIsAddDialogOpen(false);
  };

  const enabledCount = filteredSchedules.filter((s) => s.enabled).length;

  return (
    <div className="space-y-6">
      {!zoneId && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Automation Scheduling</h2>
            <p className="text-gray-600">Configure and manage automated tasks</p>
          </div>
          {user?.role === 'Admin' && (
            <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              New Schedule
            </Button>
          )}
        </div>
      )}
      
      {zoneId && user?.role === 'Admin' && (
        <div className="flex justify-end">
          <Button className="gap-2" onClick={() => {
            setNewZoneId(zoneId);
            setIsAddDialogOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            New Schedule
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Schedules</p>
                <p className="text-3xl font-bold mt-1">{scheduleList.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{enabledCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-3xl font-bold text-gray-600 mt-1">
                  {scheduleList.length - enabledCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      <div className="space-y-4">
        {filteredSchedules.map((schedule) => (
          <Card key={schedule.id} className={!schedule.enabled ? 'opacity-60' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{schedule.name}</h3>
                      <Badge variant={schedule.enabled ? 'default' : 'secondary'}>
                        {schedule.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{schedule.action}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{schedule.frequency}</span>
                      </div>
                      <div>
                        <span className="font-medium">Zone:</span> {schedule.zoneName}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={() => handleToggle(schedule.id)}
                    disabled={!canEditZone(schedule.zoneId)}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(schedule)}
                    disabled={!canEditZone(schedule.zoneId)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {user?.role === 'Admin' && (
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Nhật ký thực thi lịch trình
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduleExecutions.map((execution) => {
              const schedule = scheduleList.find(s => s.id === execution.scheduleId);
              if (!schedule) return null;

              return (
                <div key={execution.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    execution.status === 'Success' ? 'bg-green-100' :
                    execution.status === 'Failed' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {execution.status === 'Success' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : execution.status === 'Failed' ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{schedule.name}</h4>
                      <Badge variant={
                        execution.status === 'Success' ? 'default' :
                        execution.status === 'Failed' ? 'destructive' : 'secondary'
                      }>
                        {execution.status === 'Success' ? 'Thành công' :
                         execution.status === 'Failed' ? 'Thất bại' : 'Bỏ qua'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {execution.result || execution.error}
                    </p>
                    <p className="text-xs text-gray-400">
                      Thực thi lúc: {new Date(execution.executionTime).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {user?.role === 'Operator' && filteredSchedules.length > 0 && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ℹ️ Bạn có thể chỉnh sửa lịch trình trong các khu vực được gán. Các điều khiển bị vô hiệu hóa là cho các khu vực bạn không có quyền truy cập.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lịch trình</DialogTitle>
            <DialogDescription>
              Thực hiện thay đổi cho lịch trình của bạn tại đây. Nhấn lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên lịch trình</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Hành động</Label>
              <Select
                value={editAction}
                onValueChange={(value) => setEditAction(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn hành động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bật hệ thống tưới">Bật hệ thống tưới</SelectItem>
                  <SelectItem value="Tắt hệ thống tưới">Tắt hệ thống tưới</SelectItem>
                  <SelectItem value="Bật đèn chiếu sáng">Bật đèn chiếu sáng</SelectItem>
                  <SelectItem value="Tắt đèn chiếu sáng">Tắt đèn chiếu sáng</SelectItem>
                  <SelectItem value="Phun sương tự động">Phun sương tự động</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Giờ bắt đầu</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Giờ kết thúc</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Tần suất</Label>
              <Select
                value={editFrequency}
                onValueChange={(value) => setEditFrequency(value as 'Daily' | 'Weekly' | 'Custom')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn tần suất" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Hàng ngày</SelectItem>
                  <SelectItem value="Weekly">Hàng tuần</SelectItem>
                  <SelectItem value="Custom">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              className="ml-2"
              onClick={handleSave}
            >
              Lưu
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Schedule Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm lịch trình</DialogTitle>
            <DialogDescription>
              Tạo một lịch trình mới cho hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên lịch trình</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone">Khu vực</Label>
              <Select
                value={newZoneId}
                onValueChange={(value) => setNewZoneId(value)}
                disabled={!!zoneId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn khu vực" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(zone => (
                    <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Hành động</Label>
              <Select
                value={newAction}
                onValueChange={(value) => setNewAction(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn hành động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bật hệ thống tưới">Bật hệ thống tưới</SelectItem>
                  <SelectItem value="Tắt hệ thống tưới">Tắt hệ thống tưới</SelectItem>
                  <SelectItem value="Bật đèn chiếu sáng">Bật đèn chiếu sáng</SelectItem>
                  <SelectItem value="Tắt đèn chiếu sáng">Tắt đèn chiếu sáng</SelectItem>
                  <SelectItem value="Phun sương tự động">Phun sương tự động</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newStartTime">Giờ bắt đầu</Label>
                <Input
                  id="newStartTime"
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newEndTime">Giờ kết thúc</Label>
                <Input
                  id="newEndTime"
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Tần suất</Label>
              <Select
                value={newFrequency}
                onValueChange={(value) => setNewFrequency(value as 'Daily' | 'Weekly' | 'Custom')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn tần suất" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Hàng ngày</SelectItem>
                  <SelectItem value="Weekly">Hàng tuần</SelectItem>
                  <SelectItem value="Custom">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              className="ml-2"
              onClick={handleAdd}
            >
              Lưu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}