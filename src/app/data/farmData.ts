// Mock data for Smart Farm IoT System - Reflects ERD Structure

export interface Zone {
  id: string;
  name: string;
  area: string;
  cropType: string;
  description?: string;
  targetMetrics?: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    soilMoisture: { min: number; max: number };
    light: { min: number; max: number };
  };
  status: 'Active' | 'Inactive' | 'Warning';
  deviceCount: number;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  light: number;
  plantCount?: number;
  plantTypes?: string[];
}

export interface DeviceConfig {
  minValue?: number;
  maxValue?: number;
  samplingInterval?: number; // in seconds
  alertThreshold?: number;
}

export interface Device {
  id: string;
  name: string;
  type: 'Sensor' | 'Actuator' | 'Camera' | 'Controller';
  deviceType: string; // Specific type: temperature_sensor, humidity_sensor, valve, etc.
  zoneId: string;
  status: 'Online' | 'Offline' | 'Error';
  mode: 'Auto' | 'Manual'; // Auto: controlled by system, Manual: controlled by user
  battery?: number;
  lastUpdate: string;
  config?: DeviceConfig;
  currentValue?: number; // Current sensor reading or actuator state
}

export interface SensorData {
  id: string;
  deviceId: string;
  timestamp: string;
  value: number;
  unit: string;
}

export interface ActionType {
  id: string;
  name: string;
  type: 'Notify' | 'SetValue' | 'ControlDevice';
  description: string;
}

export interface ThresholdAction {
  id: string;
  thresholdId: string;
  actionType: 'Notify' | 'SetValue' | 'ControlDevice';
  targetDeviceId?: string; // For SetValue or ControlDevice actions
  targetValue?: number; // For SetValue actions
  notifyUsers?: string[]; // User IDs to notify
  enabled: boolean;
}

export interface Alert {
  id: string;
  type: 'Critical' | 'Warning' | 'Info';
  severity: 'High' | 'Medium' | 'Low';
  message: string;
  zoneId: string;
  zoneName: string;
  deviceId?: string;
  deviceName?: string;
  thresholdId?: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface ScheduleExecution {
  id: string;
  scheduleId: string;
  executionTime: string;
  status: 'Success' | 'Failed' | 'Skipped';
  result?: string;
  error?: string;
}

export interface Schedule {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  deviceId?: string;
  deviceName?: string;
  action: string;
  frequency: 'Daily' | 'Weekly' | 'Custom';
  startTime: string;
  endTime: string;
  enabled: boolean;
  lastExecution?: string;
  nextExecution?: string;
}

export interface Threshold {
  id: string;
  zoneId: string;
  zoneName: string;
  deviceId?: string;
  deviceName?: string;
  parameter: 'Temperature' | 'Humidity' | 'Soil Moisture' | 'Light';
  min: number;
  max: number;
  unit: string;
  enabled: boolean;
  actions: ThresholdAction[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Operator';
  status: 'Active' | 'Inactive';
  lastActive: string;
  assignedZones?: string[]; // Zone IDs that this operator can manage
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: 'Admin' | 'Operator';
  action: 'Create' | 'Update' | 'Delete' | 'Assign' | 'Control';
  targetType: 'Threshold' | 'Schedule' | 'Device' | 'Zone Assignment' | 'User';
  targetId: string;
  targetName: string;
  zoneId?: string;
  zoneName?: string;
  deviceId?: string;
  deviceName?: string;
  changes: string;
  timestamp: string;
  ipAddress?: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  severity?: 'High' | 'Medium' | 'Low' | 'All';
  dateRange: string;
  generatedBy: string;
  generatedAt: string;
  summary: string;
  alertCount: number;
  deviceIssues: number;
  zones: string[];
}

export const zones: Zone[] = [
  {
    id: 'z1',
    name: 'Khu A - Cánh đồng Bắc',
    area: '2.5 ha',
    cropType: 'Cà chua',
    status: 'Active',
    deviceCount: 12,
    temperature: 24.5,
    humidity: 68,
    soilMoisture: 45,
    light: 850,
    plantCount: 500,
    plantTypes: ['Cà chua bi', 'Cà chua thường'],
  },
  {
    id: 'z2',
    name: 'Khu B - Nhà kính Đông',
    area: '1.2 ha',
    cropType: 'Rau diếp',
    status: 'Active',
    deviceCount: 8,
    temperature: 22.3,
    humidity: 72,
    soilMoisture: 55,
    light: 920,
    plantCount: 300,
    plantTypes: ['Rau diếp xanh', 'Rau diếp đỏ', 'Rau diếp xoăn'],
  },
  {
    id: 'z3',
    name: 'Khu C - Cánh đồng Tây',
    area: '3.0 ha',
    cropType: 'Dưa chuột',
    status: 'Warning',
    deviceCount: 15,
    temperature: 28.7,
    humidity: 58,
    soilMoisture: 32,
    light: 780,
    plantCount: 600,
    plantTypes: ['Dưa chuột Nhật', 'Dưa chuột lai'],
  },
  {
    id: 'z4',
    name: 'Khu D - Nhà kính Nam',
    area: '1.8 ha',
    cropType: 'Ớt chuông',
    status: 'Active',
    deviceCount: 10,
    temperature: 23.8,
    humidity: 65,
    soilMoisture: 48,
    light: 890,
    plantCount: 400,
    plantTypes: ['Ớt chuông đỏ', 'Ớt chuông vàng', 'Ớt chuông xanh'],
  },
];

export const devices: Device[] = [
  {
    id: 'd1',
    name: 'Cảm biến nhiệt độ A1',
    type: 'Sensor',
    deviceType: 'temperature_sensor',
    zoneId: 'z1',
    status: 'Online',
    mode: 'Auto',
    battery: 85,
    lastUpdate: '2 phút trước',
    currentValue: 24.5,
    config: { samplingInterval: 300, minValue: 0, maxValue: 50 }
  },
  {
    id: 'd2',
    name: 'Cảm biến độ ẩm A2',
    type: 'Sensor',
    deviceType: 'humidity_sensor',
    zoneId: 'z1',
    status: 'Online',
    mode: 'Auto',
    battery: 92,
    lastUpdate: '1 phút trước',
    currentValue: 68,
    config: { samplingInterval: 300, minValue: 0, maxValue: 100 }
  },
  {
    id: 'd3',
    name: 'Cảm biến đất A3',
    type: 'Sensor',
    deviceType: 'soil_moisture_sensor',
    zoneId: 'z1',
    status: 'Online',
    mode: 'Auto',
    battery: 78,
    lastUpdate: '3 phút trước',
    currentValue: 45,
    config: { samplingInterval: 600, minValue: 0, maxValue: 100 }
  },
  {
    id: 'd4',
    name: 'Van tưới A4',
    type: 'Actuator',
    deviceType: 'irrigation_valve',
    zoneId: 'z1',
    status: 'Online',
    mode: 'Manual',
    lastUpdate: '5 phút trước',
    currentValue: 0, // 0 = closed, 1 = open
    config: {}
  },
  {
    id: 'd5',
    name: 'Camera A5',
    type: 'Camera',
    deviceType: 'surveillance_camera',
    zoneId: 'z1',
    status: 'Online',
    mode: 'Auto',
    lastUpdate: '1 phút trước',
    config: {}
  },
  {
    id: 'd6',
    name: 'Cảm biến nhiệt độ B1',
    type: 'Sensor',
    deviceType: 'temperature_sensor',
    zoneId: 'z2',
    status: 'Online',
    mode: 'Auto',
    battery: 88,
    lastUpdate: '2 phút trước',
    currentValue: 22.3,
    config: { samplingInterval: 300, minValue: 0, maxValue: 50 }
  },
  {
    id: 'd7',
    name: 'Cảm biến độ ẩm B2',
    type: 'Sensor',
    deviceType: 'humidity_sensor',
    zoneId: 'z2',
    status: 'Online',
    mode: 'Auto',
    battery: 95,
    lastUpdate: '1 phút trước',
    currentValue: 72,
    config: { samplingInterval: 300, minValue: 0, maxValue: 100 }
  },
  {
    id: 'd8',
    name: 'Cảm biến ánh sáng B3',
    type: 'Sensor',
    deviceType: 'light_sensor',
    zoneId: 'z2',
    status: 'Online',
    mode: 'Auto',
    battery: 72,
    lastUpdate: '4 phút trước',
    currentValue: 920,
    config: { samplingInterval: 600, minValue: 0, maxValue: 2000 }
  },
  {
    id: 'd9',
    name: 'Cảm biến nhiệt độ C1',
    type: 'Sensor',
    deviceType: 'temperature_sensor',
    zoneId: 'z3',
    status: 'Error',
    mode: 'Auto',
    battery: 15,
    lastUpdate: '25 phút trước',
    currentValue: 0,
    config: { samplingInterval: 300, minValue: 0, maxValue: 50 }
  },
  {
    id: 'd10',
    name: 'Cảm biến đất C2',
    type: 'Sensor',
    deviceType: 'soil_moisture_sensor',
    zoneId: 'z3',
    status: 'Online',
    mode: 'Auto',
    battery: 65,
    lastUpdate: '2 phút trước',
    currentValue: 32,
    config: { samplingInterval: 600, minValue: 0, maxValue: 100 }
  },
  {
    id: 'd11',
    name: 'Bộ điều khiển tưới C3',
    type: 'Controller',
    deviceType: 'irrigation_controller',
    zoneId: 'z3',
    status: 'Online',
    mode: 'Auto',
    lastUpdate: '3 phút trước',
    currentValue: 1,
    config: {}
  },
  {
    id: 'd12',
    name: 'Cảm biến nhiệt độ D1',
    type: 'Sensor',
    deviceType: 'temperature_sensor',
    zoneId: 'z4',
    status: 'Online',
    mode: 'Auto',
    battery: 90,
    lastUpdate: '1 phút trước',
    currentValue: 23.8,
    config: { samplingInterval: 300, minValue: 0, maxValue: 50 }
  },
];

export const alerts: Alert[] = [
  {
    id: 'a1',
    type: 'Critical',
    severity: 'High',
    message: 'Độ ẩm đất dưới ngưỡng (32%)',
    zoneId: 'z3',
    zoneName: 'Khu C - Cánh đồng Tây',
    deviceId: 'd10',
    deviceName: 'Cảm biến đất C2',
    thresholdId: 't6',
    timestamp: '2024-03-21T10:30:00',
    acknowledged: false,
  },
  {
    id: 'a2',
    type: 'Warning',
    severity: 'Medium',
    message: 'Nhiệt độ vượt ngưỡng tối ưu (28.7°C)',
    zoneId: 'z3',
    zoneName: 'Khu C - Cánh đồng Tây',
    deviceId: 'd9',
    deviceName: 'Cảm biến nhiệt độ C1',
    thresholdId: 't7',
    timestamp: '2024-03-21T10:25:00',
    acknowledged: false,
  },
  {
    id: 'a3',
    type: 'Critical',
    severity: 'High',
    message: 'Thiết bị ngoại tuyến: Cảm biến nhiệt độ C1',
    zoneId: 'z3',
    zoneName: 'Khu C - Cánh đồng Tây',
    deviceId: 'd9',
    deviceName: 'Cảm biến nhiệt độ C1',
    timestamp: '2024-03-21T10:10:00',
    acknowledged: true,
    acknowledgedBy: 'Jane Operator',
    acknowledgedAt: '2024-03-21T10:15:00',
  },
  {
    id: 'a4',
    type: 'Info',
    severity: 'Low',
    message: 'Tưới nước định kỳ hoàn thành thành công',
    zoneId: 'z1',
    zoneName: 'Khu A - Cánh đồng Bắc',
    deviceId: 'd4',
    deviceName: 'Van tưới A4',
    timestamp: '2024-03-21T09:30:00',
    acknowledged: true,
    acknowledgedBy: 'System',
    acknowledgedAt: '2024-03-21T09:30:00',
  },
  {
    id: 'a5',
    type: 'Warning',
    severity: 'Medium',
    message: 'Pin cảm biến thấp (15%)',
    zoneId: 'z3',
    zoneName: 'Khu C - Cánh đồng Tây',
    deviceId: 'd9',
    deviceName: 'Cảm biến nhiệt độ C1',
    timestamp: '2024-03-21T08:30:00',
    acknowledged: false,
  },
  {
    id: 'a6',
    type: 'Warning',
    severity: 'Low',
    message: 'Độ ẩm không khí cao (75%)',
    zoneId: 'z2',
    zoneName: 'Khu B - Nhà kính Đông',
    deviceId: 'd7',
    deviceName: 'Cảm biến độ ẩm B2',
    thresholdId: 't5',
    timestamp: '2024-03-21T07:45:00',
    acknowledged: true,
    acknowledgedBy: 'Bob Smith',
    acknowledgedAt: '2024-03-21T08:00:00',
  },
];

export const schedules: Schedule[] = [
  {
    id: 's1',
    name: 'Tưới nước buổi sáng',
    zoneId: 'z1',
    zoneName: 'Khu A - Cánh đồng Bắc',
    deviceId: 'd4',
    deviceName: 'Van tưới A4',
    action: 'Bắt đầu tưới nước trong 30 phút',
    frequency: 'Daily',
    startTime: '06:00',
    endTime: '06:30',
    enabled: true,
    lastExecution: '2024-03-21T06:00:00',
    nextExecution: '2024-03-22T06:00:00',
  },
  {
    id: 's2',
    name: 'Tưới nước buổi tối',
    zoneId: 'z1',
    zoneName: 'Khu A - Cánh đồng Bắc',
    deviceId: 'd4',
    deviceName: 'Van tưới A4',
    action: 'Bắt đầu tưới nước trong 45 phút',
    frequency: 'Daily',
    startTime: '18:00',
    endTime: '18:45',
    enabled: true,
    lastExecution: '2024-03-20T18:00:00',
    nextExecution: '2024-03-21T18:00:00',
  },
  {
    id: 's3',
    name: 'Điều khiển khí hậu nhà kính',
    zoneId: 'z2',
    zoneName: 'Khu B - Nhà kính Đông',
    action: 'Điều chỉnh thông gió và nhiệt',
    frequency: 'Daily',
    startTime: '08:00',
    endTime: '10:00',
    enabled: true,
    lastExecution: '2024-03-21T08:00:00',
    nextExecution: '2024-03-22T08:00:00',
  },
  {
    id: 's4',
    name: 'Tưới nước sâu hàng tuần',
    zoneId: 'z4',
    zoneName: 'Khu D - Nhà kính Nam',
    deviceId: 'd12',
    deviceName: 'Cảm biến nhiệt độ D1',
    action: 'Chu kỳ tưới nước sâu - 2 giờ',
    frequency: 'Weekly',
    startTime: '05:00',
    endTime: '07:00',
    enabled: false,
    lastExecution: '2024-03-17T05:00:00',
    nextExecution: '2024-03-24T05:00:00',
  },
];

export const thresholds: Threshold[] = [
  {
    id: 'th1',
    zoneId: 'z1',
    zoneName: 'Khu A - Cánh đồng Bắc',
    deviceId: 'd1',
    deviceName: 'Cảm biến nhiệt độ A1',
    parameter: 'Temperature',
    min: 20,
    max: 30,
    unit: '°C',
    enabled: true,
    actions: [
      {
        id: 'ta1',
        thresholdId: 'th1',
        actionType: 'Notify',
        notifyUsers: ['1', '2'],
        enabled: true,
      },
    ],
  },
  {
    id: 'th2',
    zoneId: 'z1',
    zoneName: 'Khu A - Cánh đồng Bắc',
    deviceId: 'd2',
    deviceName: 'Cảm biến độ ẩm A2',
    parameter: 'Soil Moisture',
    min: 40,
    max: 60,
    unit: '%',
    enabled: true,
    actions: [
      {
        id: 'ta3',
        thresholdId: 't3',
        actionType: 'Notify',
        notifyUsers: ['1', '2'],
        enabled: true,
      },
      {
        id: 'ta4',
        thresholdId: 't3',
        actionType: 'ControlDevice',
        targetDeviceId: 'd4',
        targetValue: 1, // Open irrigation valve
        enabled: true,
      },
    ],
  },
  {
    id: 't4',
    zoneId: 'z2',
    zoneName: 'Khu B',
    parameter: 'Temperature',
    min: 16,
    max: 25,
    unit: '°C',
    enabled: true,
    actions: [
      {
        id: 'ta5',
        thresholdId: 't4',
        actionType: 'Notify',
        notifyUsers: ['1', '3'],
        enabled: true,
      },
    ],
  },
  {
    id: 't5',
    zoneId: 'z2',
    zoneName: 'Khu B',
    parameter: 'Humidity',
    min: 65,
    max: 85,
    unit: '%',
    enabled: true,
    actions: [
      {
        id: 'ta6',
        thresholdId: 't5',
        actionType: 'Notify',
        notifyUsers: ['1', '3'],
        enabled: true,
      },
    ],
  },
  {
    id: 't6',
    zoneId: 'z3',
    zoneName: 'Khu C',
    parameter: 'Soil Moisture',
    min: 35,
    max: 65,
    unit: '%',
    enabled: true,
    actions: [
      {
        id: 'ta7',
        thresholdId: 't6',
        actionType: 'Notify',
        notifyUsers: ['1', '2'],
        enabled: true,
      },
      {
        id: 'ta8',
        thresholdId: 't6',
        actionType: 'ControlDevice',
        targetDeviceId: 'd11',
        targetValue: 1,
        enabled: true,
      },
    ],
  },
  {
    id: 't7',
    zoneId: 'z3',
    zoneName: 'Khu C',
    parameter: 'Temperature',
    min: 18,
    max: 30,
    unit: '°C',
    enabled: true,
    actions: [
      {
        id: 'ta9',
        thresholdId: 't7',
        actionType: 'Notify',
        notifyUsers: ['1', '2'],
        enabled: true,
      },
    ],
  },
];

export const users: UserAccount[] = [
  { id: '1', name: 'John Admin', email: 'admin@smartfarm.com', role: 'Admin', status: 'Active', lastActive: 'Just now' },
  { id: '2', name: 'Jane Operator', email: 'operator@smartfarm.com', role: 'Operator', status: 'Active', lastActive: '5 min ago', assignedZones: ['z1', 'z3'] },
  { id: '3', name: 'Bob Smith', email: 'bob@smartfarm.com', role: 'Operator', status: 'Active', lastActive: '2 hours ago', assignedZones: ['z2', 'z4'] },
  { id: '4', name: 'Alice Johnson', email: 'alice@smartfarm.com', role: 'Operator', status: 'Inactive', lastActive: '2 days ago', assignedZones: ['z1'] },
];

export const activityLogs: ActivityLog[] = [
  {
    id: 'al1',
    userId: '2',
    userName: 'Jane Operator',
    userRole: 'Operator',
    action: 'Update',
    targetType: 'Threshold',
    targetId: 't1',
    targetName: 'Ngưỡng nhiệt độ cho Khu A',
    zoneId: 'z1',
    zoneName: 'Khu A - Cánh đồng Bắc',
    changes: 'Min: 18°C → 18°C, Max: 26°C → 28°C',
    timestamp: '2024-03-21T10:25:00',
    ipAddress: '192.168.1.105',
  },
  {
    id: 'al2',
    userId: '3',
    userName: 'Bob Smith',
    userRole: 'Operator',
    action: 'Create',
    targetType: 'Schedule',
    targetId: 's4',
    targetName: 'Tưới nước sâu hàng tuần',
    zoneId: 'z4',
    zoneName: 'Khu D - Nhà kính Nam',
    changes: 'Frequency: Weekly, Time: Sunday 05:00 AM, Enabled: false',
    timestamp: '2024-03-21T09:30:00',
    ipAddress: '192.168.1.112',
  },
  {
    id: 'al3',
    userId: '1',
    userName: 'John Admin',
    userRole: 'Admin',
    action: 'Assign',
    targetType: 'Zone Assignment',
    targetId: 'z3',
    targetName: 'Khu C - Cánh đồng Tây',
    zoneId: 'z3',
    zoneName: 'Khu C - Cánh đồng Tây',
    changes: 'Assigned zones: z1 → z1, z3',
    timestamp: '2024-03-21T08:30:00',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'al4',
    userId: '2',
    userName: 'Jane Operator',
    userRole: 'Operator',
    action: 'Control',
    targetType: 'Device',
    targetId: 'd4',
    targetName: 'Van tưới A4',
    zoneId: 'z1',
    zoneName: 'Khu A - Cánh đồng Bắc',
    deviceId: 'd4',
    deviceName: 'Van tưới A4',
    changes: 'Mode: Auto → Manual, State: Closed → Open',
    timestamp: '2024-03-21T07:45:00',
    ipAddress: '192.168.1.105',
  },
  {
    id: 'al5',
    userId: '1',
    userName: 'John Admin',
    userRole: 'Admin',
    action: 'Update',
    targetType: 'Device',
    targetId: 'd9',
    targetName: 'Cảm biến nhiệt độ C1',
    zoneId: 'z3',
    zoneName: 'Khu C - Cánh đồng Tây',
    deviceId: 'd9',
    deviceName: 'Cảm biến nhiệt độ C1',
    changes: 'Config updated: samplingInterval: 600 → 300',
    timestamp: '2024-03-21T06:15:00',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'al6',
    userId: '3',
    userName: 'Bob Smith',
    userRole: 'Operator',
    action: 'Update',
    targetType: 'Schedule',
    targetId: 's3',
    targetName: 'Điều khiển khí hậu nhà kính',
    zoneId: 'z2',
    zoneName: 'Khu B - Nhà kính Đông',
    changes: 'Time: 07:30 AM → 08:00 AM',
    timestamp: '2024-03-20T22:10:00',
    ipAddress: '192.168.1.112',
  },
  {
    id: 'al7',
    userId: '1',
    userName: 'John Admin',
    userRole: 'Admin',
    action: 'Create',
    targetType: 'User',
    targetId: '4',
    targetName: 'Alice Johnson',
    changes: 'Role: Operator, Zones: z1',
    timestamp: '2024-03-19T14:20:00',
    ipAddress: '192.168.1.100',
  },
];

// Schedule Execution Logs
export const scheduleExecutions: ScheduleExecution[] = [
  {
    id: 'se1',
    scheduleId: 's1',
    executionTime: '2024-03-21T06:00:00',
    status: 'Success',
    result: 'Irrigation valve opened for 30 minutes',
  },
  {
    id: 'se2',
    scheduleId: 's2',
    executionTime: '2024-03-20T18:00:00',
    status: 'Success',
    result: 'Irrigation valve opened for 45 minutes',
  },
  {
    id: 'se3',
    scheduleId: 's3',
    executionTime: '2024-03-21T08:00:00',
    status: 'Success',
    result: 'Climate control adjusted successfully',
  },
  {
    id: 'se4',
    scheduleId: 's1',
    executionTime: '2024-03-20T06:00:00',
    status: 'Failed',
    error: 'Device offline - unable to control valve',
  },
  {
    id: 'se5',
    scheduleId: 's4',
    executionTime: '2024-03-17T05:00:00',
    status: 'Skipped',
    result: 'Schedule disabled by user',
  },
];

// Reports
export const reports: Report[] = [
  {
    id: 'r1',
    title: 'Báo cáo hàng ngày - 21/03/2024',
    type: 'Daily',
    severity: 'All',
    dateRange: '21/03/2024',
    generatedBy: 'John Admin',
    generatedAt: '2024-03-21T23:00:00',
    summary: 'Tổng quan hoạt động trang trại trong ngày 21/03/2024',
    alertCount: 6,
    deviceIssues: 1,
    zones: ['z1', 'z2', 'z3', 'z4'],
  },
  {
    id: 'r2',
    title: 'Báo cáo cảnh báo nghiêm trọng',
    type: 'Custom',
    severity: 'High',
    dateRange: '18/03/2024 - 21/03/2024',
    generatedBy: 'John Admin',
    generatedAt: '2024-03-21T15:30:00',
    summary: 'Các cảnh báo mức độ nghiêm trọng cao cần xử lý khẩn cấp',
    alertCount: 3,
    deviceIssues: 2,
    zones: ['z3'],
  },
  {
    id: 'r3',
    title: 'Báo cáo tuần - 15-21/03/2024',
    type: 'Weekly',
    severity: 'All',
    dateRange: '15/03/2024 - 21/03/2024',
    generatedBy: 'System',
    generatedAt: '2024-03-21T00:00:00',
    summary: 'Tổng hợp hoạt động tuần từ 15-21/03/2024',
    alertCount: 24,
    deviceIssues: 3,
    zones: ['z1', 'z2', 'z3', 'z4'],
  },
  {
    id: 'r4',
    title: 'Báo cáo tháng 2/2024',
    type: 'Monthly',
    severity: 'All',
    dateRange: '01/02/2024 - 29/02/2024',
    generatedBy: 'System',
    generatedAt: '2024-03-01T00:00:00',
    summary: 'Tổng hợp hoạt động tháng 2/2024',
    alertCount: 87,
    deviceIssues: 12,
    zones: ['z1', 'z2', 'z3', 'z4'],
  },
];

// Action Types
export const actionTypes: ActionType[] = [
  {
    id: 'at1',
    name: 'Gửi thông báo',
    type: 'Notify',
    description: 'Gửi thông báo email/SMS cho người dùng khi vượt ngưỡng',
  },
  {
    id: 'at2',
    name: 'Đặt giá trị thiết bị',
    type: 'SetValue',
    description: 'Tự động điều chỉnh giá trị cài đặt của thiết bị',
  },
  {
    id: 'at3',
    name: 'Điều khiển thiết bị',
    type: 'ControlDevice',
    description: 'Bật/tắt hoặc điều khiển trạng thái thiết bị',
  },
];

// Sensor Data (recent readings)
export const sensorData: SensorData[] = [
  { id: 'sd1', deviceId: 'd1', timestamp: '2024-03-21T10:35:00', value: 24.5, unit: '°C' },
  { id: 'sd2', deviceId: 'd2', timestamp: '2024-03-21T10:35:00', value: 68, unit: '%' },
  { id: 'sd3', deviceId: 'd3', timestamp: '2024-03-21T10:35:00', value: 45, unit: '%' },
  { id: 'sd4', deviceId: 'd6', timestamp: '2024-03-21T10:35:00', value: 22.3, unit: '°C' },
  { id: 'sd5', deviceId: 'd7', timestamp: '2024-03-21T10:35:00', value: 72, unit: '%' },
  { id: 'sd6', deviceId: 'd8', timestamp: '2024-03-21T10:35:00', value: 920, unit: 'lux' },
  { id: 'sd7', deviceId: 'd10', timestamp: '2024-03-21T10:35:00', value: 32, unit: '%' },
  { id: 'sd8', deviceId: 'd12', timestamp: '2024-03-21T10:35:00', value: 23.8, unit: '°C' },
];

// Historical data for charts
export const generateHistoricalData = (parameter: string, hours: number = 24) => {
  const data = [];
  const now = new Date();

  for (let i = hours; i > 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    const dataIndex = hours - i + 1;

    let value = 0;
    switch (parameter) {
      case 'temperature':
        value = 20 + Math.sin(hour / 24 * Math.PI * 2) * 8 + Math.random() * 2;
        break;
      case 'humidity':
        value = 65 + Math.cos(hour / 24 * Math.PI * 2) * 15 + Math.random() * 5;
        break;
      case 'soilMoisture':
        value = 50 + Math.sin((hour + 6) / 24 * Math.PI * 2) * 20 + Math.random() * 3;
        break;
      case 'light':
        value = hour >= 6 && hour <= 18 ? 700 + Math.random() * 300 : 50 + Math.random() * 50;
        break;
    }

    // Create unique time identifier with timestamp to avoid duplicate keys
    const timestamp = time.getTime();
    const timeLabel = `${String(hour).padStart(2, '0')}:00`;

    data.push({
      // Use timestamp as the unique identifier for React keys
      time: `${timeLabel}-${timestamp}`,
      displayTime: timeLabel,
      value: Math.round(value * 10) / 10,
      timestamp: timestamp,
    });
  }

  return data;
};