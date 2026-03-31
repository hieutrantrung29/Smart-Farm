// ============================================================
//  FarmDataContext.tsx (OPTIMIZED - GROUP API)
// ============================================================

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react';
import {
  zones as initialZones,
  devices as initialDevices,
  schedules as initialSchedules,
  thresholds as initialThresholds,
  alerts as initialAlerts,
  activityLogs as initialActivityLogs,
  type Zone, type Device, type Schedule,
  type Threshold, type Alert, type ActivityLog,
} from '../data/farmData';
import { toast } from 'sonner';

// ============================================================
//  CONFIG
// ============================================================
const AIO_USERNAME = "xamnhach";
const AIO_KEY      = "aio_ybHl30sJ7mXIJIva1XZ0abwSelJ4";

const GROUP_KEY = "farm";

const FEEDS = {
  temperature:  "sensor1",
  humidity:     "sensor2",
  soilMoisture: "sensor3",
  light:        "sensor4",
  pumpControl:  "button1",
  relay:        "button2",
  colorRgb:     "color-rgb",
} as const;

// ============================================================
//  API
// ============================================================
const BASE = `https://io.adafruit.com/api/v2/${AIO_USERNAME}`;

async function aioFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "X-AIO-Key": AIO_KEY,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Adafruit lỗi [${res.status}]: ${txt}`);
  }

  return res.json();
}

// 👉 Lấy toàn bộ feeds trong group (1 request)
async function getGroupFeeds() {
  return aioFetch(`/groups/${GROUP_KEY}/feeds`);
}

// 👉 Lấy history (giữ nguyên cho chart)
async function getFeedHistory(feedKey: string, limit = 24) {
  const data: { value: string; created_at: string }[] =
    await aioFetch(`/feeds/${feedKey}/data?limit=${limit}&order=asc`);

  return data.map(d => ({
    time: new Date(d.created_at).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    value: parseFloat(d.value) || 0,
  }));
}

// 👉 Gửi dữ liệu (không đổi)
async function setFeedValue(feedKey: string, value: string) {
  return aioFetch(`/feeds/${feedKey}/data`, {
    method: "POST",
    body: JSON.stringify({ value }),
  });
}

// ============================================================
//  TYPES
// ============================================================
export interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  light: number;
  pumpOn: boolean;
  relayOn: boolean;
  colorRgb: string;
}

interface ChartPoint { time: string; value: number }

interface FarmDataContextType {
  zones: Zone[]; setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
  devices: Device[]; setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  schedules: Schedule[]; setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  thresholds: Threshold[]; setThresholds: React.Dispatch<React.SetStateAction<Threshold[]>>;
  alerts: Alert[]; setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  activityLogs: ActivityLog[]; setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
  sensorData: SensorData;
  chartData: { temperature: ChartPoint[]; humidity: ChartPoint[]; soilMoisture: ChartPoint[]; light: ChartPoint[] };
  isLoadingAdafruit: boolean;
  adafruitError: string | null;
  lastUpdated: Date | null;
  handleTogglePump: (on: boolean) => Promise<void>;
  handleToggleRelay: (on: boolean) => Promise<void>;
  handleSetRgb: (hex: string) => Promise<void>;
  refreshNow: () => void;
}

const DEFAULT_SENSOR: SensorData = {
  temperature: 0,
  humidity: 0,
  soilMoisture: 0,
  light: 0,
  pumpOn: false,
  relayOn: false,
  colorRgb: '#000000',
};

const FarmDataContext = createContext<FarmDataContextType | undefined>(undefined);

// ============================================================
//  PROVIDER
// ============================================================
export function FarmDataProvider({ children }: { children: ReactNode }) {
  const [zones, setZones] = useState(initialZones);
  const [devices, setDevices] = useState(initialDevices);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [thresholds, setThresholds] = useState(initialThresholds);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [activityLogs, setActivityLogs] = useState(initialActivityLogs);

  const [sensorData, setSensorData] = useState<SensorData>(DEFAULT_SENSOR);
  const [chartData, setChartData] = useState({
    temperature: [] as ChartPoint[],
    humidity: [] as ChartPoint[],
    soilMoisture: [] as ChartPoint[],
    light: [] as ChartPoint[],
  });

  const [isLoadingAdafruit, setIsLoadingAdafruit] = useState(true);
  const [adafruitError, setAdafruitError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [chartLoaded, setChartLoaded] = useState(false);

  // ============================================================
  // 🚀 FETCH SENSOR (GROUP API - FAST)
  // ============================================================
  const fetchSensors = useCallback(async () => {
    try {
      const feeds = await getGroupFeeds();

      // Map key → value
      const map: Record<string, string> = {};
      feeds.forEach((f: any) => {
        map[f.key] = f.last_value;
      });

      const toNum = (v: string | undefined) =>
        parseFloat(v || "0") || 0;

      setSensorData({
        temperature:  toNum(map[FEEDS.temperature]),
        humidity:     toNum(map[FEEDS.humidity]),
        soilMoisture: toNum(map[FEEDS.soilMoisture]),
        light:        toNum(map[FEEDS.light]),
        pumpOn:  map[FEEDS.pumpControl] === "1",
        relayOn: map[FEEDS.relay] === "1",
        colorRgb: map[FEEDS.colorRgb] || "#000000",
      });

      setAdafruitError(null);
      setLastUpdated(new Date());

    } catch (err: unknown) {
      setAdafruitError(err instanceof Error ? err.message : 'Lỗi kết nối');
    } finally {
      setIsLoadingAdafruit(false);
    }
  }, []);

  // ============================================================
  // 📊 CHART (GIỮ NGUYÊN)
  // ============================================================
  const fetchCharts = useCallback(async () => {
    if (chartLoaded) return;
    try {
      const t = await getFeedHistory(FEEDS.temperature, 24);
      const h = await getFeedHistory(FEEDS.humidity, 24);
      const s = await getFeedHistory(FEEDS.soilMoisture, 24);
      const l = await getFeedHistory(FEEDS.light, 24);

      setChartData({ temperature: t, humidity: h, soilMoisture: s, light: l });
      setChartLoaded(true);
    } catch (err) {
      console.error('[Chart]', err);
    }
  }, [chartLoaded]);

  useEffect(() => {
    fetchSensors();
    fetchCharts();

    const interval = setInterval(fetchSensors, 8000);
    return () => clearInterval(interval);
  }, [fetchSensors, fetchCharts]);

  // ============================================================
  // 🎮 CONTROL
  // ============================================================
  const handleTogglePump = async (on: boolean) => {
    try {
      await setFeedValue(FEEDS.pumpControl, on ? "1" : "0");
      setSensorData(p => ({ ...p, pumpOn: on }));
      toast.success(`Máy bơm ${on ? 'BẬT ✅' : 'TẮT 🔴'}`);
    } catch {
      toast.error('Không thể điều khiển máy bơm');
    }
  };

  const handleToggleRelay = async (on: boolean) => {
    try {
      await setFeedValue(FEEDS.relay, on ? "1" : "0");
      setSensorData(p => ({ ...p, relayOn: on }));
      toast.success(`Relay ${on ? 'BẬT ✅' : 'TẮT 🔴'}`);
    } catch {
      toast.error('Không thể điều khiển relay');
    }
  };

  const handleSetRgb = async (hex: string) => {
    try {
      await setFeedValue(FEEDS.colorRgb, hex);
      setSensorData(p => ({ ...p, colorRgb: hex }));
      toast.success('Đèn RGB đổi màu 🎨');
    } catch {
      toast.error('Không thể đổi màu đèn');
    }
  };

  return (
    <FarmDataContext.Provider value={{
      zones, setZones, devices, setDevices,
      schedules, setSchedules, thresholds, setThresholds,
      alerts, setAlerts, activityLogs, setActivityLogs,
      sensorData, chartData,
      isLoadingAdafruit, adafruitError, lastUpdated,
      handleTogglePump, handleToggleRelay, handleSetRgb,
      refreshNow: fetchSensors,
    }}>
      {children}
    </FarmDataContext.Provider>
  );
}

// ============================================================
//  HOOK
// ============================================================
export function useFarmData() {
  const ctx = useContext(FarmDataContext);
  if (!ctx) throw new Error('useFarmData must be used within FarmDataProvider');
  return ctx;
}