import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  MapPin, Cpu, AlertTriangle, Thermometer, Droplets, Sprout, Sun,
  RefreshCw, Wifi, WifiOff, Zap, Lightbulb,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFarmData } from '../contexts/FarmDataContext';

export default function FarmDashboard() {
  const { user } = useAuth();
  const {
    zones, devices, alerts,
    sensorData, chartData,
    isLoadingAdafruit, adafruitError, lastUpdated,
    handleTogglePump, handleToggleRelay, handleSetRgb,
    refreshNow,
  } = useFarmData();

  const [selectedZone, setSelectedZone] = useState('all');
  const [pumpLoading, setPumpLoading]   = useState(false);
  const [relayLoading, setRelayLoading] = useState(false);

  // const visibleZones = user?.role === 'Admin'
  //   ? zones : zones.filter(z => canAccessZone(z.id));
  // const filteredZones = selectedZone === 'all'
  //   ? visibleZones : visibleZones.filter(z => z.id === selectedZone);
  // const activeZones  = filteredZones.filter(z => z.status === 'Active').length;
  // const warningZones = filteredZones.filter(z => z.status === 'Warning').length;

  // const visibleDevices = user?.role === 'Admin'
  //   ? devices : devices.filter(d => canAccessZone(d.zoneId));
  // const zoneDevices    = selectedZone === 'all'
  //   ? visibleDevices : visibleDevices.filter(d => d.zoneId === selectedZone);
  // const onlineDevices  = zoneDevices.filter(d => d.status === 'Online').length;

  // const visibleAlerts = user?.role === 'Admin'
  //   ? alerts : alerts.filter(a => canAccessZone(a.zoneId));
  // const zoneAlerts    = selectedZone === 'all'
  //   ? visibleAlerts : visibleAlerts.filter(a => a.zoneId === selectedZone);
  // const unackAlerts   = zoneAlerts.filter(a => !a.acknowledged).length;

// 
  const isAdmin = user?.user_type === 'admin';

  // Cập nhật mảng visible theo thuộc tính mới
  const visibleZones = isAdmin ? zones : zones; // Hoặc thêm logic lọc cho operator sau
  const filteredZones = selectedZone === 'all'
    ? visibleZones : visibleZones.filter(z => z.id === selectedZone);
  const activeZones  = filteredZones.filter(z => z.status === 'Active').length;
  const warningZones = filteredZones.filter(z => z.status === 'Warning').length;

  const visibleDevices = isAdmin ? devices : devices; 
  const zoneDevices    = selectedZone === 'all'
    ? visibleDevices : visibleDevices.filter(d => d.zoneId === selectedZone);
  const onlineDevices  = zoneDevices.filter(d => d.status === 'Online').length;

  const visibleAlerts = isAdmin ? alerts : alerts;
  const zoneAlerts    = selectedZone === 'all'
    ? visibleAlerts : visibleAlerts.filter(a => a.zoneId === selectedZone);
  const unackAlerts   = zoneAlerts.filter(a => !a.acknowledged).length;


//



  const onPumpToggle = async (on: boolean) => {
    setPumpLoading(true);
    await handleTogglePump(on);
    setPumpLoading(false);
  };
  const onRelayToggle = async (on: boolean) => {
    setRelayLoading(true);
    await handleToggleRelay(on);
    setRelayLoading(false);
  };

  return (
    <div className="space-y-8">

      {/* Connection Banner */}
      {adafruitError ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <WifiOff className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Mất kết nối Adafruit IO</p>
            <p className="text-xs text-red-500 mt-0.5">{adafruitError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshNow}>
            <RefreshCw className="w-4 h-4 mr-1" />Thử lại
          </Button>
        </div>
      ) : !isLoadingAdafruit && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg w-fit">
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700 dark:text-green-400 font-medium">Đã kết nối Adafruit IO</span>
          {lastUpdated && (
            <span className="text-xs text-green-500 ml-2">· Cập nhật {lastUpdated.toLocaleTimeString('vi-VN')}</span>
          )}
          <Button variant="ghost" size="sm" onClick={refreshNow} className="ml-1 h-7 px-2">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Zone Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Xem thống kê cho:</label>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-64 h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khu vực</SelectItem>
                {visibleZones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Live Sensor Data */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          📡 Dữ liệu thực tế từ YoloBit
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Nhiệt độ',    val: isLoadingAdafruit ? '...' : `${sensorData.temperature.toFixed(1)}°C`, icon: Thermometer, color: 'red',   bg: 'bg-red-100 dark:bg-red-900/30' },
            { label: 'Độ ẩm',       val: isLoadingAdafruit ? '...' : `${sensorData.humidity.toFixed(0)}%`,    icon: Droplets,    color: 'blue',  bg: 'bg-blue-100 dark:bg-blue-900/30' },
            { label: 'Độ ẩm đất',  val: isLoadingAdafruit ? '...' : `${sensorData.soilMoisture.toFixed(0)}%`, icon: Sprout,      color: 'lime',  bg: 'bg-lime-100 dark:bg-lime-900/30' },
            { label: 'Ánh sáng',   val: isLoadingAdafruit ? '...' : `${sensorData.light.toFixed(0)} Lux`,     icon: Sun,         color: 'amber', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          ].map(({ label, val, icon: Icon, color, bg }) => (
            <Card key={label} className={`border-2 border-${color}-200 dark:border-${color}-800`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</p>
                    <p className={`text-3xl font-bold ${isLoadingAdafruit ? 'animate-pulse text-gray-300' : ''}`}>{val}</p>
                  </div>
                  <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${color}-500`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Device Controls */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          🎛️ Điều khiển thiết bị
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Pump */}
          <Card className={`border-2 transition-colors ${sensorData.pumpOn ? 'border-blue-400' : 'border-gray-200 dark:border-gray-700'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sensorData.pumpOn ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Droplets className={`w-5 h-5 ${sensorData.pumpOn ? 'text-blue-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium">Máy bơm</p>
                    <Badge variant={sensorData.pumpOn ? 'default' : 'secondary'} className="mt-1">
                      {sensorData.pumpOn ? 'Đang chạy' : 'Dừng'}
                    </Badge>
                  </div>
                </div>
                <Switch
                  checked={sensorData.pumpOn}
                  onCheckedChange={onPumpToggle}
                  disabled={pumpLoading || !!adafruitError}
                />
              </div>
              {pumpLoading && <p className="text-xs text-gray-400 mt-2 animate-pulse">Đang gửi lệnh tới YoloBit...</p>}
            </CardContent>
          </Card>

          {/* Relay */}
          <Card className={`border-2 transition-colors ${sensorData.relayOn ? 'border-orange-400' : 'border-gray-200 dark:border-gray-700'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sensorData.relayOn ? 'bg-orange-100 dark:bg-orange-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Zap className={`w-5 h-5 ${sensorData.relayOn ? 'text-orange-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium">Relay</p>
                    <Badge variant={sensorData.relayOn ? 'default' : 'secondary'} className="mt-1">
                      {sensorData.relayOn ? 'Đang bật' : 'Tắt'}
                    </Badge>
                  </div>
                </div>
                <Switch
                  checked={sensorData.relayOn}
                  onCheckedChange={onRelayToggle}
                  disabled={relayLoading || !!adafruitError}
                />
              </div>
              {relayLoading && <p className="text-xs text-gray-400 mt-2 animate-pulse">Đang gửi lệnh tới YoloBit...</p>}
            </CardContent>
          </Card>

          {/* RGB */}
          <Card className="border-2 transition-all" style={{ borderColor: sensorData.colorRgb !== '#000000' ? sensorData.colorRgb : undefined }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: sensorData.colorRgb + '33' }}>
                    <Lightbulb className="w-5 h-5" style={{ color: sensorData.colorRgb !== '#000000' ? sensorData.colorRgb : '#9ca3af' }} />
                  </div>
                  <div>
                    <p className="font-medium">Đèn RGB</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">{sensorData.colorRgb}</p>
                  </div>
                </div>
                <input
                  type="color"
                  value={sensorData.colorRgb}
                  onChange={e => handleSetRgb(e.target.value)}
                  disabled={!!adafruitError}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                  title="Chọn màu đèn RGB"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Khu vực hoạt động', val: activeZones,     sub: warningZones > 0 ? `${warningZones} cảnh báo` : null, icon: MapPin, color: 'green'  },
          { label: 'Thiết bị online',    val: onlineDevices,   sub: `/ ${zoneDevices.length} tổng`,                        icon: Cpu,    color: 'blue'   },
          { label: 'Cảnh báo chưa xử lý',val: unackAlerts,    sub: null,                                                   icon: AlertTriangle, color: 'red' },
          { label: 'Tổng khu vực',       val: filteredZones.length, sub: null,                                             icon: MapPin, color: 'purple' },
        ].map(({ label, val, sub, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">{label}</p>
                  <p className="text-3xl font-bold">{val}</p>
                  {sub && <p className={`text-xs mt-2 ${color === 'red' ? 'text-orange-600' : 'text-gray-500'}`}>{sub}</p>}
                </div>
                <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          📈 Biểu đồ lịch sử (từ Adafruit IO)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { title: 'Nhiệt độ (°C)',      data: chartData.temperature,  type: 'area', color: '#ef4444', fill: '#fee2e2', unit: '°C' },
            { title: 'Độ ẩm (%)',           data: chartData.humidity,     type: 'line', color: '#0ea5e9', fill: '',        unit: '%'  },
            { title: 'Độ ẩm đất (%)',      data: chartData.soilMoisture, type: 'area', color: '#84cc16', fill: '#d9f99d', unit: '%'  },
            { title: 'Ánh sáng (Lux)',      data: chartData.light,        type: 'bar',  color: '#f59e0b', fill: '#f59e0b', unit: ' Lux' },
          ].map(({ title, data, type, color, fill, unit }) => (
            <Card key={title}>
              <CardHeader className="pb-4"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-56">
                  {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      {isLoadingAdafruit ? 'Đang tải...' : 'Chưa có dữ liệu từ Adafruit'}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      {type === 'bar' ? (
                        <BarChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                          <YAxis stroke="#6b7280" tick={{ fontSize: 9 }} />
                          <Tooltip formatter={(v: number) => [`${v.toFixed(1)}${unit}`, title]} />
                          <Bar dataKey="value" fill={color} />
                        </BarChart>
                      ) : type === 'line' ? (
                        <LineChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                          <YAxis stroke="#6b7280" tick={{ fontSize: 9 }} />
                          <Tooltip formatter={(v: number) => [`${v.toFixed(1)}${unit}`, title]} />
                          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
                        </LineChart>
                      ) : (
                        <AreaChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                          <YAxis stroke="#6b7280" tick={{ fontSize: 9 }} />
                          <Tooltip formatter={(v: number) => [`${v.toFixed(1)}${unit}`, title]} />
                          <Area type="monotone" dataKey="value" stroke={color} fill={fill} />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader><CardTitle>Cảnh báo gần đây</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {zoneAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${alert.type === 'Critical' ? 'text-red-600' : alert.type === 'Warning' ? 'text-orange-600' : 'text-blue-600'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={alert.type === 'Critical' ? 'destructive' : alert.type === 'Warning' ? 'default' : 'secondary'}>{alert.type}</Badge>
                    <span className="text-sm text-gray-500">{alert.timestamp}</span>
                  </div>
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.zoneName}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
