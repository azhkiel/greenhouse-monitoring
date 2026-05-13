import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Thermometer, Droplets, Sun, Wind,
  Leaf, Clock, RefreshCw, AlertTriangle, History,
} from "lucide-react";

import { API_URL, REFRESH_INTERVAL_MS } from "../constants/api";
import { formatDateTime } from "../utils/greenhouse";
import {
  MetricCard, RainGauge, SoilMoisture,
  LightHours, ActuatorPanel, MpcControl,
} from "../components/greenhouse";

// ─── ENV metric config ────────────────────────────────────────────────────────
const ENV_METRICS = (d) => [
  {
    icon: Thermometer, label: "Suhu", value: d.suhu, unit: "°C",
    sub: d.suhu > 35 ? "⚠ Terlalu panas" : "Normal",
    iconClass: "text-red-500",
  },
  {
    icon: Droplets, label: "Kelembapan Udara", value: d.humidity_udara, unit: "%",
    sub: d.humidity_udara > 80 ? "Lembap tinggi" : "Normal",
    iconClass: "text-cyan-500",
  },
  {
    icon: Sun, label: "Cahaya", value: d.cahaya, unit: "%",
    sub: "Intensitas sensor",
    iconClass: "text-amber-500",
  },
  {
    icon: Wind, label: "Fan PWM", value: d.fan_pwm, unit: "",
    sub: `MPC: ${d.fan_mpc_control}%`,
    iconClass: "text-violet-500",
  },
];

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-2.5">
      {children}
    </p>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function GreenhouseDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (json.success && json.data?.length) {
        // Ambil data dengan datetime paling baru (sort DESC)
        const sorted = [...json.data].sort(
          (a, b) => new Date(b.datetime) - new Date(a.datetime)
        );
        setData(sorted[0]);
        setLastFetch(new Date());
      } else {
        setError("Data tidak tersedia dari server.");
      }
    } catch {
      setError("Gagal menghubungi server. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-16">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-7">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-700 rounded-xl flex items-center justify-center text-white shrink-0">
            <Leaf size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Greenhouse Monitor
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Sistem Monitoring &amp; Kontrol Otomatis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {lastFetch && (
            <span className="text-xs text-slate-400">
              Update: {lastFetch.toLocaleTimeString("id-ID")}
            </span>
          )}
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition"
          >
            <History size={14} />
            History
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && !data && (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
          <div className="w-9 h-9 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm">Mengambil data sensor...</span>
        </div>
      )}

      {/* ── Error ── */}
      {error && !data && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-red-700">
          <AlertTriangle size={20} className="mx-auto mb-2" />
          <p className="font-semibold">Koneksi Gagal</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* ── Content ── */}
      {data && (
        <div className="space-y-5">

          {/* Device badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <strong>Device:</strong> {data.id}
            <span className="text-slate-300">|</span>
            <Clock size={12} />
            {formatDateTime(data.datetime)} WIB
          </div>

          {/* Env metrics */}
          <div>
            <SectionLabel>Kondisi Lingkungan</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ENV_METRICS(data).map((m) => (
                <MetricCard key={m.label} {...m} />
              ))}
            </div>
          </div>

          {/* Sensor kalibrasi */}
          <div>
            <SectionLabel>Sensor Kalibrasi</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RainGauge pct={data.hujan_percent} />
              <SoilMoisture pct={data.kelembapan_tanah} />
            </div>
          </div>

          {/* Cahaya & Aktuator */}
          <div>
            <SectionLabel>Cahaya &amp; Aktuator</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LightHours
                natural={data.natural_light_hours}
                lamp={data.lamp_light_hours}
                total={data.total_light_hours}
                target={data.target_light_hours}
              />
              <ActuatorPanel data={data} />
            </div>
          </div>

          {/* MPC */}
          <div>
            <SectionLabel>Parameter MPC (Model Predictive Control)</SectionLabel>
            <MpcControl data={data} />
          </div>

        </div>
      )}
    </div>
  );
}