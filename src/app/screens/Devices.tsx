import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { type Device, type DeviceConfig } from '../data/farmData';
import { Cpu, Search, Plus, Clock, Settings, Trash2, Edit, Power } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFarmData } from '../contexts/FarmDataContext';
import { toast } from 'sonner';

export default function Devices({ zoneId }: { zoneId?: string }) {
  const auth = useAuth();
  const user = auth?.user;
  // const canAccessZone = auth?.canAccessZone ?? (() => true);
  // const canEditZone = auth?.canEditZone ?? (() => true);
  const canAccessZone = true;
  const canEditZone = true;
  const { devices: devicesList, setDevices: setDevicesList, zones, sensorData, handleTogglePump: handleTogglePumpAdafruit, handleToggleRelay: handleToggleRelayAdafruit, handleSetRgb } = useFarmData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterZone, setFilterZone] = useState(zoneId || 'all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'Sensor' | 'Actuator' | 'Camera' | 'Controller'>('Sensor');
  const [formDeviceType, setFormDeviceType] = useState('');
  const [formZoneId, setFormZoneId] = useState('');
  const [formMode, setFormMode] = useState<'Auto' | 'Manual'>('Auto');

  // Config state
  const [configMinValue, setConfigMinValue] = useState('');
  const [configMaxValue, setConfigMaxValue] = useState('');
  const [configSamplingInterval, setConfigSamplingInterval] = useState('');

  // Filter zones and devices based on user permissions
  const initialVisibleZones = user?.user_type === 'admin'
    ? zones
    : zones.filter(zone => (zone.id));
  
  const visibleZones = zoneId
    ? initialVisibleZones.filter(z => z.id === zoneId)
    : initialVisibleZones;

  const initialVisibleDevices = user?.user_type === 'admin'
    ? devicesList
    : devicesList.filter(device => (device.zoneId));
    
  const visibleDevices = zoneId
    ? initialVisibleDevices.filter(d => d.zoneId === zoneId)
    : initialVisibleDevices;

  const filteredDevices = visibleDevices.filter((device) => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = filterZone === 'all' || device.zoneId === filterZone;
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    const matchesMode = filterMode === 'all' || device.mode === filterMode;
    return matchesSearch && matchesZone && matchesStatus && matchesMode;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
        return 'bg-green-500';
      case 'Offline':
        return 'bg-gray-500';
      case 'Error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAddDevice = () => {
    const newDevice: Device = {
      id: `d${Date.now()}`,
      name: formName,
      type: formType,
      deviceType: formDeviceType,
      zoneId: formZoneId,
      status: 'Online',
      mode: formMode,
      lastUpdate: 'Vừa xong',
      currentValue: 0,
      config: {
        minValue: 0,
        maxValue: 100,
        samplingInterval: 300,
      }
    };
    setDevicesList([...devicesList, newDevice]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditDevice = () => {
    if (!selectedDevice) return;

    setDevicesList(devicesList.map(d =>
      d.id === selectedDevice.id
        ? {
            ...d,
            name: formName,
            type: formType,
            deviceType: formDeviceType,
            zoneId: formZoneId,
            mode: formMode,
          }
        : d
    ));
    resetForm();
    setIsEditDialogOpen(false);
  };

  const handleDeleteDevice = (deviceId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
      setDevicesList(devicesList.filter(d => d.id !== deviceId));
    }
  };

  const handleToggleMode = (deviceId: string, zoneId: string) => {
    if (!(zoneId)) {
      alert('Bạn không có quyền điều khiển thiết bị trong khu vực này');
      return;
    }

    setDevicesList(devicesList.map(d =>
      d.id === deviceId
        ? { ...d, mode: d.mode === 'Auto' ? 'Manual' : 'Auto' }
        : d
    ));
  };

  const handleToggleDevicePower = (deviceId: string, currentVal: number | undefined) => {
    const newVal = currentVal ? 0 : 1;
    setDevicesList(devicesList.map(d =>
      d.id === deviceId
        ? { ...d, currentValue: newVal }
        : d
    ));
    toast.success(`Đã ${newVal ? 'bật' : 'tắt'} thiết bị`);
  };

  // Điều khiển thiết bị thật qua Adafruit
  const handleTogglePump = async (deviceId: string, currentVal: number | undefined) => {
    const newVal = currentVal ? 0 : 1;
    setDevicesList(devicesList.map(d => d.id === deviceId ? { ...d, currentValue: newVal, lastUpdate: 'Vừa xong' } : d));
    await handleTogglePumpAdafruit(newVal === 1);
  };

  const handleToggleRelay = async (deviceId: string, currentVal: number | undefined) => {
    const newVal = currentVal ? 0 : 1;
    setDevicesList(devicesList.map(d => d.id === deviceId ? { ...d, currentValue: newVal, lastUpdate: 'Vừa xong' } : d));
    await handleToggleRelayAdafruit(newVal === 1);
  };

  const handleSetRgbDevice = async (deviceId: string, hex: string) => {
    setDevicesList(devicesList.map(d => d.id === deviceId ? { ...d, lastUpdate: 'Vừa xong' } : d));
    await handleSetRgb(hex);
  };

  const handleUpdateConfig = () => {
    if (!selectedDevice) return;

    const newConfig: DeviceConfig = {
      minValue: configMinValue ? parseFloat(configMinValue) : undefined,
      maxValue: configMaxValue ? parseFloat(configMaxValue) : undefined,
      samplingInterval: configSamplingInterval ? parseInt(configSamplingInterval) : undefined,
    };

    setDevicesList(devicesList.map(d =>
      d.id === selectedDevice.id
        ? { ...d, config: newConfig }
        : d
    ));

    setIsConfigDialogOpen(false);
    setSelectedDevice(null);
  };

  const openEditDialog = (device: Device) => {
    setSelectedDevice(device);
    setFormName(device.name);
    setFormType(device.type);
    setFormDeviceType(device.deviceType);
    setFormZoneId(device.zoneId);
    setFormMode(device.mode);
    setIsEditDialogOpen(true);
  };

  const openConfigDialog = (device: Device) => {
    setSelectedDevice(device);
    setConfigMinValue(device.config?.minValue?.toString() || '');
    setConfigMaxValue(device.config?.maxValue?.toString() || '');
    setConfigSamplingInterval(device.config?.samplingInterval?.toString() || '');
    setIsConfigDialogOpen(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormType('Sensor');
    setFormDeviceType('');
    setFormZoneId('');
    setFormMode('Auto');
    setSelectedDevice(null);
  };

  return (
    <div className="space-y-6">
      {!zoneId && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Quản lý thiết bị</h2>
            <p className="text-gray-600">Giám sát và điều khiển tất cả thiết bị IoT</p>
          </div>
          {user?.user_type === 'admin' && (
            <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Thêm thiết bị
            </Button>
          )}
        </div>
      )}
      
      {zoneId && user?.user_type === 'admin' && (
        <div className="flex justify-end">
          <Button className="gap-2" onClick={() => {
            setFormZoneId(zoneId);
            setIsAddDialogOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            Thêm thiết bị
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm thiết bị..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {!zoneId && (
              <Select value={filterZone} onValueChange={setFilterZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  {visibleZones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Offline">Offline</SelectItem>
                <SelectItem value="Error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMode} onValueChange={setFilterMode}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả chế độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chế độ</SelectItem>
                <SelectItem value="Auto">Tự động</SelectItem>
                <SelectItem value="Manual">Thủ công</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Device Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng thiết bị</p>
              <p className="text-3xl font-bold mt-1">{visibleDevices.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Online</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {visibleDevices.filter((d) => d.status === 'Online').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Offline</p>
              <p className="text-3xl font-bold text-gray-600 mt-1">
                {visibleDevices.filter((d) => d.status === 'Offline').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tự động</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {visibleDevices.filter((d) => d.mode === 'Auto').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Thủ công</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {visibleDevices.filter((d) => d.mode === 'Manual').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => {
          const zone = zones.find((z) => z.id === device.zoneId);
          const canEdit = (device.zoneId);

          return (
            <Card key={device.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      device.type === 'Sensor' ? 'bg-blue-100' :
                      device.type === 'Actuator' ? 'bg-green-100' :
                      device.type === 'Camera' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      <Cpu className={`w-5 h-5 ${
                        device.type === 'Sensor' ? 'text-blue-600' :
                        device.type === 'Actuator' ? 'text-green-600' :
                        device.type === 'Camera' ? 'text-purple-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{device.name}</h3>
                      <p className="text-xs text-gray-500">{device.deviceType}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`} />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Khu vực:</span>
                    <span className="font-medium">{zone?.name.split(' - ')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Loại:</span>
                    <Badge variant="outline">{device.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Chế độ:</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={device.mode === 'Auto' ? 'default' : 'secondary'}>
                        {device.mode === 'Auto' ? 'Tự động' : 'Thủ công'}
                      </Badge>
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleToggleMode(device.id, device.zoneId)}
                        >
                          <Power className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {device.currentValue !== undefined && device.type !== 'Actuator' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Giá trị hiện tại:</span>
                      <span className="font-medium">
                        {device.zoneId === 'z1'
                          ? device.deviceType === 'temperature_sensor'   ? `${sensorData.temperature.toFixed(1)}°C`
                          : device.deviceType === 'humidity_sensor'      ? `${sensorData.humidity.toFixed(0)}%`
                          : device.deviceType === 'soil_moisture_sensor' ? `${sensorData.soilMoisture.toFixed(0)}%`
                          : device.deviceType === 'light_sensor'         ? `${sensorData.light.toFixed(0)} Lux`
                          : device.currentValue
                          : device.currentValue}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cập nhật:</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs">{device.lastUpdate}</span>
                    </div>
                  </div>
                  
                  {device.mode === 'Manual' && canEdit && (
                    <div className="flex items-center justify-between text-sm pt-2 mt-2 border-t">
                      {device.deviceType === 'rgb_light' ? (
                        <>
                          <span className="text-gray-600 font-medium">Màu đèn RGB:</span>
                          <input
                            type="color"
                            defaultValue={sensorData.colorRgb}
                            onChange={e => handleSetRgbDevice(device.id, e.target.value)}
                            className="w-10 h-8 rounded cursor-pointer border-0 bg-transparent"
                            title="Chọn màu đèn"
                          />
                        </>
                      ) : device.deviceType === 'pump' ? (
                        <>
                          <span className="text-gray-600 font-medium">Máy bơm:</span>
                          <Switch
                            checked={!!device.currentValue}
                            onCheckedChange={() => handleTogglePump(device.id, device.currentValue)}
                          />
                        </>
                      ) : device.deviceType === 'relay' ? (
                        <>
                          <span className="text-gray-600 font-medium">Relay:</span>
                          <Switch
                            checked={!!device.currentValue}
                            onCheckedChange={() => handleToggleRelay(device.id, device.currentValue)}
                          />
                        </>
                      ) : (
                        <>
                          <span className="text-gray-600 font-medium">Bật / Tắt:</span>
                          <Switch
                            checked={!!device.currentValue}
                            onCheckedChange={() => handleToggleDevicePower(device.id, device.currentValue)}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {canEdit && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => openConfigDialog(device)}
                      >
                        <Settings className="w-3 h-3" />
                        Cấu hình
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => openEditDialog(device)}
                      >
                        <Edit className="w-3 h-3" />
                        Sửa
                      </Button>
                    </>
                  )}
                  {user?.user_type === 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteDevice(device.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDevices.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Không tìm thấy thiết bị nào</p>
          </CardContent>
        </Card>
      )}

      {/* Add Device Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm thiết bị mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin thiết bị mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên thiết bị</Label>
              <Input
                id="name"
                placeholder="Tên thiết bị"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Loại thiết bị</Label>
                <Select value={formType} onValueChange={(v: any) => setFormType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sensor">Sensor</SelectItem>
                    <SelectItem value="Actuator">Actuator</SelectItem>
                    <SelectItem value="Camera">Camera</SelectItem>
                    <SelectItem value="Controller">Controller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">Khu vực</Label>
                <Select value={formZoneId} onValueChange={setFormZoneId} disabled={!!zoneId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleZones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(false);
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleAddDevice}>
              Thêm thiết bị
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thiết bị</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin thiết bị
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên thiết bị</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Loại thiết bị</Label>
                <Select value={formType} onValueChange={(v: any) => setFormType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sensor">Sensor</SelectItem>
                    <SelectItem value="Actuator">Actuator</SelectItem>
                    <SelectItem value="Camera">Camera</SelectItem>
                    <SelectItem value="Controller">Controller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-zone">Khu vực</Label>
                <Select value={formZoneId} onValueChange={setFormZoneId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleZones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsEditDialogOpen(false);
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleEditDevice}>
              Lưu thay đổi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Config Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Cấu hình thiết bị</DialogTitle>
            <DialogDescription>
              Điều chỉnh thông số cấu hình cho thiết bị {selectedDevice?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minValue">Giá trị tối thiểu</Label>
              <Input
                id="minValue"
                type="number"
                placeholder="0"
                value={configMinValue}
                onChange={(e) => setConfigMinValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxValue">Giá trị tối đa</Label>
              <Input
                id="maxValue"
                type="number"
                placeholder="100"
                value={configMaxValue}
                onChange={(e) => setConfigMaxValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="samplingInterval">Khoảng thời gian lấy mẫu (giây)</Label>
              <Input
                id="samplingInterval"
                type="number"
                placeholder="300"
                value={configSamplingInterval}
                onChange={(e) => setConfigSamplingInterval(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfigDialogOpen(false);
                setSelectedDevice(null);
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateConfig}>
              Lưu cấu hình
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
