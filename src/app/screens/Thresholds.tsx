import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { type Threshold, type ActivityLog, type ThresholdAction } from '../data/farmData';
import { Edit, Plus, History, AlertTriangle, CheckCircle2, Bell, Settings as SettingsIcon, Power, Trash2, Cpu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFarmData } from '../contexts/FarmDataContext';

export function Thresholds({ zoneId }: { zoneId?: string }) {
  const { user, canEditZone } = useAuth();
  const { thresholds, setThresholds, activityLogs, setActivityLogs, zones, devices } = useFarmData();
  const [editingThreshold, setEditingThreshold] = useState<Threshold | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [editMin, setEditMin] = useState('');
  const [editMax, setEditMax] = useState('');
  const [selectedThresholdForActions, setSelectedThresholdForActions] = useState<Threshold | null>(null);

  // New threshold form state
  const [newZoneId, setNewZoneId] = useState(zoneId || '');
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newParameter, setNewParameter] = useState('Temperature');
  const [newMin, setNewMin] = useState('');
  const [newMax, setNewMax] = useState('');
  const [newUnit, setNewUnit] = useState('°C');
  const [newActionType, setNewActionType] = useState<'Notify' | 'SetValue' | 'ControlDevice'>('Notify');

  // Action form state
  const [newActionDeviceId, setNewActionDeviceId] = useState('');
  const [newActionValue, setNewActionValue] = useState('');

  // Filter thresholds based on user permissions
  const initialFilteredThresholds = user?.role === 'Admin' 
    ? thresholds 
    : thresholds.filter(t => user?.assignedZones?.includes(t.zoneId));
    
  const filteredThresholds = zoneId
    ? initialFilteredThresholds.filter(t => t.zoneId === zoneId)
    : initialFilteredThresholds;

  const handleEdit = (threshold: Threshold) => {
    if (!canEditZone(threshold.zoneId)) {
      alert('You do not have permission to edit thresholds in this zone.');
      return;
    }
    setEditingThreshold(threshold);
    setEditMin(threshold.min.toString());
    setEditMax(threshold.max.toString());
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingThreshold) return;

    const minValue = parseFloat(editMin);
    const maxValue = parseFloat(editMax);

    if (isNaN(minValue) || isNaN(maxValue)) {
      alert('Please enter valid numbers');
      return;
    }

    if (minValue >= maxValue) {
      alert('Minimum value must be less than maximum value');
      return;
    }

    const updatedThresholds = thresholds.map(t =>
      t.id === editingThreshold.id
        ? { ...t, min: minValue, max: maxValue }
        : t
    );

    // Add activity log
    const newLog: ActivityLog = {
      id: `al${Date.now()}`,
      userId: user?.id || '',
      userName: user?.name || '',
      userRole: (user?.role || 'Operator') as 'Admin' | 'Operator',
      action: 'Update',
      targetType: 'Threshold',
      targetId: editingThreshold.id,
      targetName: `${editingThreshold.parameter} Threshold for ${editingThreshold.zoneName}`,
      zoneId: editingThreshold.zoneId,
      zoneName: editingThreshold.zoneName,
      changes: `Min: ${minValue}${editingThreshold.unit}, Max: ${maxValue}${editingThreshold.unit}`,
      timestamp: 'Just now',
    };

    setThresholds(updatedThresholds);
    setActivityLogs([newLog, ...activityLogs]);
    setIsDialogOpen(false);
    setEditingThreshold(null);
  };

  const handleAddThreshold = () => {
    if (!newDeviceId) {
      alert('Vui lòng chọn thiết bị');
      return;
    }

    const minValue = parseFloat(newMin);
    const maxValue = parseFloat(newMax);

    if (isNaN(minValue) || isNaN(maxValue)) {
      alert('Vui lòng nhập số hợp lệ');
      return;
    }

    if (minValue >= maxValue) {
      alert('Giá trị tối thiểu phải nhỏ hơn giá trị tối đa');
      return;
    }

    const device = devices.find(d => d.id === newDeviceId);

    const initialAction: ThresholdAction = {
      id: `ta${Date.now()}`,
      thresholdId: `t${Date.now()}`,
      actionType: newActionType,
      notifyUsers: newActionType === 'Notify' ? [user?.id || ''] : undefined,
      enabled: true,
    };

    const newThreshold: Threshold = {
      id: `t${Date.now()}`,
      zoneId: newZoneId,
      zoneName: getZoneName(newZoneId),
      deviceId: newDeviceId,
      deviceName: device?.name,
      parameter: newParameter as any,
      min: minValue,
      max: maxValue,
      unit: newUnit,
      enabled: true,
      actions: [initialAction],
    };

    const updatedThresholds = [...thresholds, newThreshold];

    // Add activity log
    const newLog: ActivityLog = {
      id: `al${Date.now()}`,
      userId: user?.id || '',
      userName: user?.name || '',
      userRole: (user?.role || 'Operator') as 'Admin' | 'Operator',
      action: 'Create',
      targetType: 'Threshold',
      targetId: newThreshold.id,
      targetName: `${newThreshold.parameter} Threshold for ${newThreshold.zoneName}`,
      zoneId: newThreshold.zoneId,
      zoneName: newThreshold.zoneName,
      changes: `Min: ${minValue}${newThreshold.unit}, Max: ${maxValue}${newThreshold.unit}, Action: ${newActionType}`,
      timestamp: 'Just now',
    };

    setThresholds(updatedThresholds);
    setActivityLogs([newLog, ...activityLogs]);
    setIsAddDialogOpen(false);
  };

  const getZoneName = (zoneId: string) => {
    return zones.find(z => z.id === zoneId)?.name || zoneId;
  };

  const handleAddAction = () => {
    if (!selectedThresholdForActions) return;

    const newAction: ThresholdAction = {
      id: `ta${Date.now()}`,
      thresholdId: selectedThresholdForActions.id,
      actionType: newActionType,
      targetDeviceId: newActionType !== 'Notify' ? newActionDeviceId : undefined,
      targetValue: newActionType === 'SetValue' ? parseFloat(newActionValue) : undefined,
      notifyUsers: newActionType === 'Notify' ? [user?.id || ''] : undefined,
      enabled: true,
    };

    const updatedThresholds = thresholds.map(t =>
      t.id === selectedThresholdForActions.id
        ? { ...t, actions: [...(t.actions || []), newAction] }
        : t
    );

    setThresholds(updatedThresholds);
    setNewActionDeviceId('');
    setNewActionValue('');
    setIsActionDialogOpen(false);
  };

  const handleToggleAction = (thresholdId: string, actionId: string) => {
    const updatedThresholds = thresholds.map(t =>
      t.id === thresholdId
        ? {
            ...t,
            actions: t.actions.map(a =>
              a.id === actionId ? { ...a, enabled: !a.enabled } : a
            ),
          }
        : t
    );
    setThresholds(updatedThresholds);
  };

  const handleDeleteAction = (thresholdId: string, actionId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hành động này?')) return;

    const updatedThresholds = thresholds.map(t =>
      t.id === thresholdId
        ? { ...t, actions: t.actions.filter(a => a.id !== actionId) }
        : t
    );
    setThresholds(updatedThresholds);
  };

  const getStatusColor = (threshold: Threshold) => {
    const zone = zones.find(z => z.id === threshold.zoneId);
    if (!zone) return 'text-gray-500';

    let currentValue = 0;
    switch (threshold.parameter) {
      case 'Temperature':
        currentValue = zone.temperature;
        break;
      case 'Humidity':
        currentValue = zone.humidity;
        break;
      case 'Soil Moisture':
        currentValue = zone.soilMoisture;
        break;
      case 'Light':
        currentValue = zone.light;
        break;
    }

    if (currentValue < threshold.min || currentValue > threshold.max) {
      return 'text-red-600';
    }
    return 'text-green-600';
  };

  const isInRange = (threshold: Threshold) => {
    const zone = zones.find(z => z.id === threshold.zoneId);
    if (!zone) return true;

    let currentValue = 0;
    switch (threshold.parameter) {
      case 'Temperature':
        currentValue = zone.temperature;
        break;
      case 'Humidity':
        currentValue = zone.humidity;
        break;
      case 'Soil Moisture':
        currentValue = zone.soilMoisture;
        break;
      case 'Light':
        currentValue = zone.light;
        break;
    }

    return currentValue >= threshold.min && currentValue <= threshold.max;
  };

  return (
    <div className={zoneId ? "space-y-6" : "p-6 space-y-6"}>
      {!zoneId && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cài đặt ngưỡng & Hành động</h1>
            <p className="text-gray-500 mt-1">
              {user?.role === 'Admin'
                ? 'Quản lý cài đặt ngưỡng và hành động tự động cho tất cả khu vực'
                : `Quản lý ngưỡng và hành động cho các khu vực được gán`}
            </p>
          </div>
          {user?.role === 'Admin' && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm ngưỡng
            </Button>
          )}
        </div>
      )}
      
      {zoneId && user?.role === 'Admin' && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => {
            setNewZoneId(zoneId);
            setIsAddDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm ngưỡng
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threshold Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Ngưỡng hoạt động
          </h2>
          {filteredThresholds.map((threshold) => (
            <Card key={threshold.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                       {threshold.parameter}
                       {threshold.deviceName && (
                         <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                           <Cpu className="w-3 h-3"/>
                           {threshold.deviceName}
                         </span>
                       )}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{getZoneName(threshold.zoneId)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isInRange(threshold) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Giá trị tối thiểu:</span>
                    <span className={`font-semibold ${getStatusColor(threshold)}`}>
                      {threshold.min}{threshold.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Giá trị tối đa:</span>
                    <span className={`font-semibold ${getStatusColor(threshold)}`}>
                      {threshold.max}{threshold.unit}
                    </span>
                  </div>

                  {/* Actions */}
                  {threshold.actions && threshold.actions.length > 0 && (
                    <div className="pt-3 border-t">
                      <h4 className="text-sm font-medium mb-2">Hành động tự động:</h4>
                      <div className="space-y-2">
                        {threshold.actions.map((action) => (
                          <div key={action.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              {action.actionType === 'Notify' && <Bell className="w-3 h-3" />}
                              {action.actionType === 'SetValue' && <SettingsIcon className="w-3 h-3" />}
                              {action.actionType === 'ControlDevice' && <Power className="w-3 h-3" />}
                              <span className="text-xs">
                                {action.actionType === 'Notify' ? 'Thông báo' :
                                 action.actionType === 'SetValue' ? `Đặt giá trị: ${action.targetValue}` :
                                 'Điều khiển thiết bị'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Switch
                                checked={action.enabled}
                                onCheckedChange={() => handleToggleAction(threshold.id, action.id)}
                                disabled={!canEditZone(threshold.zoneId)}
                              />
                              {canEditZone(threshold.zoneId) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleDeleteAction(threshold.id, action.id)}
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleEdit(threshold)}
                      disabled={!canEditZone(threshold.zoneId)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa ngưỡng
                    </Button>
                    {canEditZone(threshold.zoneId) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedThresholdForActions(threshold);
                          setIsActionDialogOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm hành động
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity History */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Activity
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {activityLogs
                  .filter(log => log.targetType === 'Threshold')
                  .slice(0, 10)
                  .map((log) => (
                    <div key={log.id} className="border-l-2 border-blue-500 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{log.targetName}</p>
                          <p className="text-sm text-gray-600">{log.changes}</p>
                          <p className="text-xs text-gray-400">
                            by {log.userName} • {log.timestamp}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {log.action}
                        </span>
                      </div>
                    </div>
                  ))}
                {activityLogs.filter(log => log.targetType === 'Threshold').length === 0 && (
                  <p className="text-center text-gray-400 py-8">No threshold changes yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Chỉnh sửa ngưỡng {editingThreshold?.parameter}
            </DialogTitle>
            <DialogDescription>
              Cập nhật giá trị tối thiểu và tối đa cho ngưỡng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="zone">Khu vực</Label>
              <Input
                id="zone"
                value={editingThreshold ? getZoneName(editingThreshold.zoneId) : ''}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min">Giá trị tối thiểu ({editingThreshold?.unit})</Label>
              <Input
                id="min"
                type="number"
                value={editMin}
                onChange={(e) => setEditMin(e.target.value)}
                placeholder="Nhập giá trị tối thiểu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Giá trị tối đa ({editingThreshold?.unit})</Label>
              <Input
                id="max"
                type="number"
                value={editMax}
                onChange={(e) => setEditMax(e.target.value)}
                placeholder="Nhập giá trị tối đa"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                Lưu thay đổi
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Thêm ngưỡng mới
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin cho ngưỡng mới.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="zone">Khu vực</Label>
              <Input
                id="zone"
                value={newZoneId}
                onChange={(e) => setNewZoneId(e.target.value)}
                placeholder="Nhập ID khu vực"
                disabled={!!zoneId}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device">Thiết bị</Label>
              <Select value={newDeviceId} onValueChange={setNewDeviceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thiết bị trong khu vực" />
                </SelectTrigger>
                <SelectContent>
                  {devices.filter(d => (!newZoneId || d.zoneId === newZoneId)).map(device => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parameter">Thông số cấu hình</Label>
              <Select value={newParameter} onValueChange={(v) => {
                setNewParameter(v);
                setNewUnit(v === 'Temperature' ? '°C' : v === 'Light' ? 'Lux' : '%');
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Temperature">Nhiệt độ (°C)</SelectItem>
                  <SelectItem value="Humidity">Độ ẩm (%)</SelectItem>
                  <SelectItem value="Soil Moisture">Độ ẩm đất (%)</SelectItem>
                  <SelectItem value="Light">Ánh sáng (Lux)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min">Ngưỡng tối thiểu ({newUnit})</Label>
                <Input
                  id="min"
                  type="number"
                  value={newMin}
                  onChange={(e) => setNewMin(e.target.value)}
                  placeholder="VD: 20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Ngưỡng tối đa ({newUnit})</Label>
                <Input
                  id="max"
                  type="number"
                  value={newMax}
                  onChange={(e) => setNewMax(e.target.value)}
                  placeholder="VD: 30"
                />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t mt-4">
              <Label htmlFor="action">Biện pháp khi vượt ngưỡng</Label>
              <Select value={newActionType} onValueChange={(v: any) => setNewActionType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Notify">Gửi thông báo đến người vận hành</SelectItem>
                  <SelectItem value="ControlDevice">Trạng thái an toàn tự động</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleAddThreshold} className="flex-1">
                Thêm ngưỡng
              </Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Thêm hành động tự động
            </DialogTitle>
            <DialogDescription>
              Cấu hình hành động sẽ thực hiện khi vượt ngưỡng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="actionType">Loại hành động</Label>
              <Select value={newActionType} onValueChange={(v: any) => setNewActionType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Notify">Gửi thông báo</SelectItem>
                  <SelectItem value="SetValue">Đặt giá trị thiết bị</SelectItem>
                  <SelectItem value="ControlDevice">Điều khiển thiết bị</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newActionType !== 'Notify' && (
              <div className="space-y-2">
                <Label htmlFor="device">Thiết bị</Label>
                <Select value={newActionDeviceId} onValueChange={setNewActionDeviceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thiết bị" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices
                      .filter(d => d.zoneId === selectedThresholdForActions?.zoneId)
                      .map(device => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newActionType === 'SetValue' && (
              <div className="space-y-2">
                <Label htmlFor="value">Giá trị đặt</Label>
                <Input
                  id="value"
                  type="number"
                  value={newActionValue}
                  onChange={(e) => setNewActionValue(e.target.value)}
                  placeholder="Nhập giá trị"
                />
              </div>
            )}

            {newActionType === 'Notify' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  Thông báo sẽ được gửi đến tất cả quản trị viên và người điều hành được gán cho khu vực này.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={handleAddAction} className="flex-1">
                Thêm hành động
              </Button>
              <Button variant="outline" onClick={() => setIsActionDialogOpen(false)} className="flex-1">
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}