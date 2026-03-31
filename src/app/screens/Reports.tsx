import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { zones, devices, alerts, generateHistoricalData, reports } from '../data/farmData';
import { Download, FileText, TrendingUp, TrendingDown, Calendar, Filter, MapPin } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useMemo } from 'react';

export default function Reports() {
  const [timeRange, setTimeRange] = useState('7days');
  const [reportType, setReportType] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const handleExportPDF = () => {
    alert('Exporting report as PDF...');
  };

  const handleExportCSV = () => {
    alert('Exporting report as CSV...');
  };

  // Filter reports based on severity, type, and zone
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSeverity = severityFilter === 'All' || report.severity === severityFilter;
      const matchesType = reportType === 'all' || report.type.toLowerCase() === reportType.toLowerCase();
      const matchesZone = selectedZone === 'all' || report.zones.includes(selectedZone);
      return matchesSeverity && matchesType && matchesZone;
    });
  }, [severityFilter, reportType, selectedZone]);

  // Filter alerts based on severity and zone
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;
    if (severityFilter !== 'All') {
      filtered = filtered.filter((alert) => alert.severity === severityFilter);
    }
    if (selectedZone !== 'all') {
      filtered = filtered.filter((alert) => alert.zoneId === selectedZone);
    }
    return filtered;
  }, [severityFilter, selectedZone]);

  // Filter zones and devices based on selection
  const filteredZones = selectedZone === 'all' ? zones : zones.filter(z => z.id === selectedZone);
  const filteredDevices = selectedZone === 'all' ? devices : devices.filter(d => d.zoneId === selectedZone);

  const temperatureData = generateHistoricalData('temperature', 24);
  const humidityData = generateHistoricalData('humidity', 24);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Báo cáo & Phân tích</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Tạo và xuất báo cáo hiệu suất trang trại</p>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle>Bộ lọc báo cáo</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Khu vực</label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại báo cáo</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="daily">Hàng ngày</SelectItem>
                  <SelectItem value="weekly">Hàng tuần</SelectItem>
                  <SelectItem value="monthly">Hàng tháng</SelectItem>
                  <SelectItem value="custom">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mức độ nghiêm trọng</label>
              <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as any)}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Tất cả</SelectItem>
                  <SelectItem value="High">Cao</SelectItem>
                  <SelectItem value="Medium">Trung bình</SelectItem>
                  <SelectItem value="Low">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Khoảng thời gian</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24hours">24 giờ qua</SelectItem>
                  <SelectItem value="7days">7 ngày qua</SelectItem>
                  <SelectItem value="30days">30 ngày qua</SelectItem>
                  <SelectItem value="custom">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Xuất báo cáo</label>
              <div className="flex gap-2">
                <Button className="flex-1 gap-2 h-10" onClick={handleExportPDF}>
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button variant="outline" className="flex-1 gap-2 h-10" onClick={handleExportCSV}>
                  <Download className="w-4 h-4" />
                  CSV
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tổng số báo cáo</span>
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold mb-2">{filteredReports.length}</p>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Đã lọc từ {reports.length} báo cáo</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Thiết bị hoạt động</span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold mb-2">
              {filteredDevices.filter((d) => d.status === 'Online').length}
            </p>
            <div className="flex items-center gap-1 text-blue-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>
                {Math.round(
                  (filteredDevices.filter((d) => d.status === 'Online').length / filteredDevices.length) * 100
                )}
                % Hoạt động
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cảnh báo ({severityFilter})</span>
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold mb-2">{filteredAlerts.length}</p>
            <div className="flex items-center gap-1 text-orange-600 text-sm">
              <TrendingDown className="w-4 h-4" />
              <span>Cần xử lý</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Khu vực</span>
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold mb-2">{filteredZones.length}</p>
            <div className="flex items-center gap-1 text-purple-600 text-sm">
              <span className="truncate">{selectedZone === 'all' ? 'Tất cả khu vực' : filteredZones[0]?.name}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zone Performance Summary Cards */}
      <Card>
        <CardHeader className="pb-6">
          <CardTitle>Tổng quan hiệu suất theo khu vực</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredZones.map((zone) => {
              const zoneAlerts = alerts.filter((a) => a.zoneId === zone.id);
              const zoneDevices = devices.filter((d) => d.zoneId === zone.id);
              const onlineDevices = zoneDevices.filter((d) => d.status === 'Online');
              
              return (
                <Card key={zone.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          zone.status === 'Active' 
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-orange-100 dark:bg-orange-900/30'
                        }`}>
                          <MapPin className={`w-5 h-5 ${
                            zone.status === 'Active'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-orange-600 dark:text-orange-400'
                          }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate leading-tight">{zone.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 truncate">{zone.cropType}</p>
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
                        className="flex-shrink-0 ml-2 whitespace-nowrap"
                      >
                        {zone.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-gray-600 flex-shrink-0">Diện tích:</span>
                        <span className="font-medium truncate text-right">{zone.area}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-gray-600 flex-shrink-0">Thiết bị:</span>
                        <span className="font-medium flex-shrink-0">{onlineDevices.length}/{zoneDevices.length}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-gray-600 flex-shrink-0">Cảnh báo:</span>
                        <Badge variant={zoneAlerts.length > 0 ? 'destructive' : 'secondary'} className="text-xs flex-shrink-0">
                          {zoneAlerts.length}
                        </Badge>
                      </div>
                      {zone.plantCount && (
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-gray-600 flex-shrink-0">Số cây:</span>
                          <span className="font-medium flex-shrink-0">{zone.plantCount}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader className="pb-6">
          <CardTitle>Danh sách báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium">Tiêu đề</th>
                  <th className="text-left py-4 px-4 font-medium">Loại</th>
                  <th className="text-left py-4 px-4 font-medium">Mức độ</th>
                  <th className="text-left py-4 px-4 font-medium">Khoảng thời gian</th>
                  <th className="text-center py-4 px-4 font-medium">Cảnh báo</th>
                  <th className="text-center py-4 px-4 font-medium">Sự cố thiết bị</th>
                  <th className="text-left py-4 px-4 font-medium">Người tạo</th>
                  <th className="text-center py-4 px-4 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4 px-4 font-medium">{report.title}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline">{report.type}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          report.severity === 'High'
                            ? 'destructive'
                            : report.severity === 'Medium'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {report.severity === 'All' ? 'Tất cả' : report.severity === 'High' ? 'Cao' : report.severity === 'Medium' ? 'Trung bình' : 'Thấp'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm">{report.dateRange}</td>
                    <td className="py-4 px-4 text-center">{report.alertCount}</td>
                    <td className="py-4 px-4 text-center">{report.deviceIssues}</td>
                    <td className="py-4 px-4 text-sm">{report.generatedBy}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={handleExportPDF}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredReports.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Không có báo cáo nào phù h���p với bộ lọc</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environmental Metrics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-6">
            <CardTitle>Phân tích nhiệt độ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayTime" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} name="Nhiệt độ (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div>
                <p className="text-xs text-gray-600 mb-1">Trung bình</p>
                <p className="font-semibold">24.3°C</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Thấp nhất</p>
                <p className="font-semibold">18.2°C</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Cao nhất</p>
                <p className="font-semibold">29.1°C</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-6">
            <CardTitle>Phân tích độ ẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={humidityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayTime" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" name="Độ ẩm (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div>
                <p className="text-xs text-gray-600 mb-1">Trung bình</p>
                <p className="font-semibold">65.8%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Thấp nhất</p>
                <p className="font-semibold">52.3%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Cao nhất</p>
                <p className="font-semibold">78.9%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}