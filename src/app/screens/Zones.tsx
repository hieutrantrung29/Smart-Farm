import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import Devices from './Devices';
import Scheduling from './Scheduling';
import FarmAlerts from './FarmAlerts';
import { Thresholds } from './Thresholds';
import { type Zone, type Device } from '../data/farmData';
import { MapPin, Thermometer, Droplets, Sprout, Sun, Plus, Edit, Cpu, Power, Settings, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFarmData } from '../contexts/FarmDataContext';
import { toast } from 'sonner';

export default function Zones() {
  const { user } = useAuth();
  const { zones: zonesList, setZones: setZonesList, devices: devicesList, sensorData } = useFarmData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // New zone form state
  const [newName, setNewName] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newCropType, setNewCropType] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTempMin, setNewTempMin] = useState('18');
  const [newTempMax, setNewTempMax] = useState('28');
  const [newHumidMin, setNewHumidMin] = useState('60');
  const [newHumidMax, setNewHumidMax] = useState('80');
  const [newLightMin, setNewLightMin] = useState('500');
  const [newLightMax, setNewLightMax] = useState('1000');
  const [newSoilMin, setNewSoilMin] = useState('40');
  const [newSoilMax, setNewSoilMax] = useState('70');
  const [newCustomCrop, setNewCustomCrop] = useState('');
  
  // Edit zone form state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editZoneId, setEditZoneId] = useState('');
  const [editName, setEditName] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editCropType, setEditCropType] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTempMin, setEditTempMin] = useState('18');
  const [editTempMax, setEditTempMax] = useState('28');
  const [editHumidMin, setEditHumidMin] = useState('60');
  const [editHumidMax, setEditHumidMax] = useState('80');
  const [editLightMin, setEditLightMin] = useState('500');
  const [editLightMax, setEditLightMax] = useState('1000');
  const [editSoilMin, setEditSoilMin] = useState('40');
  const [editSoilMax, setEditSoilMax] = useState('70');
  const [editCustomCrop, setEditCustomCrop] = useState('');
  
  // Filter zones based on user permissions
  const visibleZones = user?.user_type === 'admin' 
    ? zonesList 
    : zonesList.filter(zone =>true);
  
  const uniqueCrops = Array.from(new Set(zonesList.map(z => z.cropType).filter(Boolean)));
  
  const handleCropSelect = (value: string, isEdit: boolean) => {
    if (isEdit) {
      setEditCropType(value);
      if (value !== 'other') setEditCustomCrop('');
    } else {
      setNewCropType(value);
      if (value !== 'other') setNewCustomCrop('');
    }
    
    if (value && value !== 'other') {
      const existingZone = zonesList.find(z => z.cropType === value && z.targetMetrics);
      if (existingZone && existingZone.targetMetrics) {
        const m = existingZone.targetMetrics;
        if (isEdit) {
          setEditTempMin(m.temperature.min.toString());
          setEditTempMax(m.temperature.max.toString());
          setEditHumidMin(m.humidity.min.toString());
          setEditHumidMax(m.humidity.max.toString());
          setEditSoilMin(m.soilMoisture.min.toString());
          setEditSoilMax(m.soilMoisture.max.toString());
          setEditLightMin(m.light.min.toString());
          setEditLightMax(m.light.max.toString());
        } else {
          setNewTempMin(m.temperature.min.toString());
          setNewTempMax(m.temperature.max.toString());
          setNewHumidMin(m.humidity.min.toString());
          setNewHumidMax(m.humidity.max.toString());
          setNewSoilMin(m.soilMoisture.min.toString());
          setNewSoilMax(m.soilMoisture.max.toString());
          setNewLightMin(m.light.min.toString());
          setNewLightMax(m.light.max.toString());
        }
      }
    }
  };

  const [selectedZone, setSelectedZone] = useState(visibleZones[0]);

  // Get devices for selected zone
  const zoneDevices = devicesList.filter(d => d.zoneId === selectedZone.id);
  const onlineDevices = zoneDevices.filter(d => d.status === 'Online').length;

  const handleAddZone = () => {
    const finalCropType = newCropType === 'other' ? newCustomCrop : newCropType;
    if (!newName || !newArea || !finalCropType) {
      toast.error('Vui lòng điền đầy đủ thông tin tên, diện tích, và loại cây trồng');
      return;
    }

    const newZone: Zone = {
      id: `z${Date.now()}`,
      name: newName,
      area: newArea,
      cropType: finalCropType,
      description: newDescription,
      targetMetrics: {
        temperature: { min: Number(newTempMin), max: Number(newTempMax) },
        humidity: { min: Number(newHumidMin), max: Number(newHumidMax) },
        soilMoisture: { min: Number(newSoilMin), max: Number(newSoilMax) },
        light: { min: Number(newLightMin), max: Number(newLightMax) },
      },
      status: 'Active',
      temperature: 22,
      humidity: 65,
      soilMoisture: 55,
      light: 750,
      deviceCount: 0,
      plantCount: 1, // as specified, "mỗi zone chỉ được trồng 1 cây" which could mean just 1 crop type, but we set plantCount = 1
      plantTypes: [finalCropType],
    };

    setZonesList([...zonesList, newZone]);
    setIsAddDialogOpen(false);
    setNewName('');
    setNewArea('');
    setNewCropType('');
    setNewCustomCrop('');
    setNewDescription('');
    setNewTempMin('18');
    setNewTempMax('28');
    setNewHumidMin('60');
    setNewHumidMax('80');
    setNewLightMin('500');
    setNewLightMax('1000');
    setNewSoilMin('40');
    setNewSoilMax('70');
    toast.success('Đã thêm khu vực mới');
  };

  const handleOpenEditZone = (zone: Zone) => {
    setEditZoneId(zone.id);
    setEditName(zone.name);
    setEditArea(zone.area);
    const isExistingCrop = uniqueCrops.includes(zone.cropType);
    setEditCropType(isExistingCrop ? zone.cropType : 'other');
    setEditCustomCrop(isExistingCrop ? '' : zone.cropType);
    setEditDescription(zone.description || '');
    setEditTempMin(zone.targetMetrics?.temperature?.min.toString() || '18');
    setEditTempMax(zone.targetMetrics?.temperature?.max.toString() || '28');
    setEditHumidMin(zone.targetMetrics?.humidity?.min.toString() || '60');
    setEditHumidMax(zone.targetMetrics?.humidity?.max.toString() || '80');
    setEditSoilMin(zone.targetMetrics?.soilMoisture?.min.toString() || '40');
    setEditSoilMax(zone.targetMetrics?.soilMoisture?.max.toString() || '70');
    setEditLightMin(zone.targetMetrics?.light?.min.toString() || '500');
    setEditLightMax(zone.targetMetrics?.light?.max.toString() || '1000');
    setIsEditDialogOpen(true);
  };

  const handleEditZone = () => {
    const finalCropType = editCropType === 'other' ? editCustomCrop : editCropType;
    if (!editName || !editArea || !finalCropType) {
      toast.error('Vui lòng điền đầy đủ thông tin tên, diện tích, và loại cây trồng');
      return;
    }

    const updatedZones = zonesList.map(z => {
      if (z.id === editZoneId) {
        return {
          ...z,
          name: editName,
          area: editArea,
          cropType: finalCropType,
          description: editDescription,
          targetMetrics: {
            temperature: { min: Number(editTempMin), max: Number(editTempMax) },
            humidity: { min: Number(editHumidMin), max: Number(editHumidMax) },
            soilMoisture: { min: Number(editSoilMin), max: Number(editSoilMax) },
            light: { min: Number(editLightMin), max: Number(editLightMax) },
          },
          plantTypes: [finalCropType],
        };
      }
      return z;
    });

    setZonesList(updatedZones);
    
    // Update selected zone if it's the one we just edited
    if (selectedZone.id === editZoneId) {
      const updatedZone = updatedZones.find(z => z.id === editZoneId);
      if (updatedZone) setSelectedZone(updatedZone);
    }
    
    setIsEditDialogOpen(false);
    toast.success('Đã cập nhật biểu mẫu khu vực');
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Quản lý khu vực</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Giám sát và điều khiển các khu vực trang trại</p>
          </div>
          {user?.user_type === 'admin' && (
            <Button className="gap-2 h-10 px-4" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Thêm khu vực
            </Button>
          )}
        </div>

        {/* Zone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleZones.map((zone) => (
            <Card
              key={zone.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedZone.id === zone.id
                  ? 'ring-2 ring-green-500 shadow-lg'
                  : ''
              }`}
              onClick={() => setSelectedZone(zone)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate leading-tight">{zone.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">{zone.area}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      zone.status === 'Active'
                        ? 'default'
                        : zone.status === 'Warning'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="flex-shrink-0 whitespace-nowrap"
                  >
                    {zone.status}
                  </Badge>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-600 flex-shrink-0">Cây trồng:</span>
                    <span className="font-medium truncate text-right">{zone.cropType}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-600 flex-shrink-0">Thiết bị:</span>
                    <span className="font-medium flex-shrink-0">{zone.deviceCount}</span>
                  </div>
                  {zone.plantCount && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-600 flex-shrink-0">Số cây:</span>
                      <span className="font-medium flex-shrink-0">{zone.plantCount}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Zone Details */}
        <div className="space-y-6">
          {/* Zone Info Card */}
          <Card>
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedZone.name}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {selectedZone.area} • {selectedZone.cropType}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Badge
                    variant={
                      selectedZone.status === 'Active'
                        ? 'default'
                        : selectedZone.status === 'Warning'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="h-8 px-4"
                  >
                    {selectedZone.status}
                  </Badge>
                  {user?.user_type === 'admin' && (
                    <Button variant="outline" size="sm" className="gap-2 h-8" onClick={() => handleOpenEditZone(selectedZone)}>
                      <Edit className="w-4 h-4" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tổng diện tích</p>
                  <p className="text-xl font-bold">{selectedZone.area}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Số cây trồng</p>
                  <p className="text-xl font-bold">{selectedZone.plantCount || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Thiết bị</p>
                  <p className="text-xl font-bold">{zoneDevices.length}</p>
                  <p className="text-xs text-green-600 mt-1">{onlineDevices} hoạt động</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Loại cây</p>
                  <p className="text-sm font-medium">{selectedZone.plantTypes?.length || 0} loại</p>
                </div>
              </div>
              
              {selectedZone.plantTypes && selectedZone.plantTypes.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium mb-3">Các loại cây trồng:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedZone.plantTypes.map((plant, idx) => (
                      <Badge key={idx} variant="outline" className="bg-white dark:bg-gray-800">
                        <Sprout className="w-3 h-3 mr-1" />
                        {plant}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for Zone Details */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white dark:bg-gray-800 border p-1 rounded-lg inline-flex w-auto overflow-x-auto">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="devices">Thiết bị</TabsTrigger>
              <TabsTrigger value="schedules">Lịch trình</TabsTrigger>
              <TabsTrigger value="thresholds">Ngưỡng</TabsTrigger>
              <TabsTrigger value="alerts">Cảnh báo</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Thermometer className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Nhiệt độ</p>
                        <p className="text-2xl font-bold mt-1">{selectedZone.id === 'z1' ? `${sensorData.temperature.toFixed(1)}°C` : `${selectedZone.temperature}°C`}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${((selectedZone.id === 'z1' ? sensorData.temperature : selectedZone.temperature) / 35) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Tối ưu: 18-28°C</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Độ ẩm không khí</p>
                        <p className="text-2xl font-bold mt-1">{selectedZone.id === 'z1' ? `${sensorData.humidity.toFixed(0)}%` : `${selectedZone.humidity}%`}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(selectedZone.id === 'z1' ? sensorData.humidity : selectedZone.humidity)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Tối ưu: 60-80%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sprout className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Độ ẩm đất</p>
                        <p className="text-2xl font-bold mt-1">{selectedZone.id === 'z1' ? `${sensorData.soilMoisture.toFixed(0)}%` : `${selectedZone.soilMoisture}%`}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          (selectedZone.id === 'z1' ? sensorData.soilMoisture : selectedZone.soilMoisture) < 35 ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(selectedZone.id === 'z1' ? sensorData.soilMoisture : selectedZone.soilMoisture)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Tối ưu: 40-70%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sun className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cường độ ánh sáng</p>
                        <p className="text-2xl font-bold mt-1">{selectedZone.id === 'z1' ? `${sensorData.light.toFixed(0)} Lux` : selectedZone.light}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${((selectedZone.id === 'z1' ? sensorData.light : selectedZone.light) / 1000) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Lux - Đo lường hiện tại</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="devices">
              <Devices zoneId={selectedZone.id} />
            </TabsContent>

            <TabsContent value="schedules">
              <Scheduling zoneId={selectedZone.id} />
            </TabsContent>

            <TabsContent value="thresholds">
              <Thresholds zoneId={selectedZone.id} />
            </TabsContent>

            <TabsContent value="alerts">
              <FarmAlerts zoneId={selectedZone.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Add Zone Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="pb-4">
              <DialogTitle>Thêm khu vực mới</DialogTitle>
              <DialogDescription className="mt-2">
                Tạo một khu vực trang trại mới. Điền thông tin bên dưới.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên khu vực</Label>
                  <Input
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="VD: Khu A - Cánh đồng Bắc"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả chi tiết</Label>
                  <Input
                    id="description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="VD: Khu vực trồng cây ăn quả"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Diện tích</Label>
                  <Input
                    id="area"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="VD: 2.5 ha"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cropType">Cây trồng (Chỉ 1 loại)</Label>
                  <Select value={newCropType} onValueChange={(val) => handleCropSelect(val, false)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Chọn cây trồng" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCrops.map(crop => (
                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                      ))}
                      <SelectItem value="other">Nhập mới...</SelectItem>
                    </SelectContent>
                  </Select>
                  {newCropType === 'other' && (
                    <Input
                      placeholder="VD: Cà chua"
                      value={newCustomCrop}
                      onChange={(e) => setNewCustomCrop(e.target.value)}
                      className="h-10 mt-2"
                    />
                  )}
                </div>
              </div>

              {/* Thông số của cây */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Thông số tối ưu cho cây trồng này (<span className="text-gray-500 text-sm">chỉ dành cho loại cây {newCropType === 'other' ? newCustomCrop || "đã nhập" : newCropType || "đã nhập"}</span>)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nhiệt độ (°C)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Min" value={newTempMin} onChange={(e) => setNewTempMin(e.target.value)} />
                      <span>-</span>
                      <Input type="number" placeholder="Max" value={newTempMax} onChange={(e) => setNewTempMax(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Độ ẩm không khí (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Min" value={newHumidMin} onChange={(e) => setNewHumidMin(e.target.value)} />
                      <span>-</span>
                      <Input type="number" placeholder="Max" value={newHumidMax} onChange={(e) => setNewHumidMax(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Độ ẩm đất (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Min" value={newSoilMin} onChange={(e) => setNewSoilMin(e.target.value)} />
                      <span>-</span>
                      <Input type="number" placeholder="Max" value={newSoilMax} onChange={(e) => setNewSoilMax(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cường độ ánh sáng (Lux)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Min" value={newLightMin} onChange={(e) => setNewLightMin(e.target.value)} />
                      <span>-</span>
                      <Input type="number" placeholder="Max" value={newLightMax} onChange={(e) => setNewLightMax(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="h-10 px-4"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleAddZone}
                className="h-10 px-4"
              >
                Thêm khu vực
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Edit Zone Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="pb-4">
              <DialogTitle>Chỉnh sửa khu vực</DialogTitle>
              <DialogDescription className="mt-2">
                Cập nhật thông tin khu vực trang trại tại đây.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Tên khu vực</Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDescription">Mô tả chi tiết</Label>
                  <Input
                    id="editDescription"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editArea">Diện tích</Label>
                  <Input
                    id="editArea"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCropType">Cây trồng (Chỉ 1 loại)</Label>
                  <Select value={editCropType} onValueChange={(val) => handleCropSelect(val, true)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Chọn cây trồng" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCrops.map(crop => (
                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                      ))}
                      <SelectItem value="other">Nhập mới...</SelectItem>
                    </SelectContent>
                  </Select>
                  {editCropType === 'other' && (
                    <Input
                      placeholder="VD: Cà chua"
                      value={editCustomCrop}
                      onChange={(e) => setEditCustomCrop(e.target.value)}
                      className="h-10 mt-2"
                    />
                  )}
                </div>
              </div>

              {/* Thông số của cây */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Thông số tối ưu cho cây trồng này (<span className="text-gray-500 text-sm">chỉ dành cho loại cây {editCropType === 'other' ? editCustomCrop || "đã nhập" : editCropType || "đã nhập"}</span>)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nhiệt độ (°C)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Min" value={editTempMin} onChange={(e) => setEditTempMin(e.target.value)} />
                      <span>-</span>
                      <Input type="number" placeholder="Max" value={editTempMax} onChange={(e) => setEditTempMax(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Độ ẩm không khí (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Min" value={editHumidMin} onChange={(e) => setEditHumidMin(e.target.value)} />
                      <span>-</span>
                      <Input type="number" placeholder="Max" value={editHumidMax} onChange={(e) => setEditHumidMax(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Độ ẩm đất (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Min" value={editSoilMin} onChange={(e) => setEditSoilMin(e.target.value)} />
                      <span>-</span>
                      <Input type="number" placeholder="Max" value={editSoilMax} onChange={(e) => setEditSoilMax(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cường độ ánh sáng (Lux)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Min" value={editLightMin} onChange={(e) => setEditLightMin(e.target.value)} />
                      <span>-</span>
                      <Input type="number" placeholder="Max" value={editLightMax} onChange={(e) => setEditLightMax(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="h-10 px-4"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleEditZone}
                className="h-10 px-4"
              >
                Lưu khu vực
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}