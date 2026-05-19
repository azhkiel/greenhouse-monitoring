"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Thermometer, Droplets, Sun, Wind,
  Leaf, Clock, RefreshCw, AlertTriangle, History,
  AlertCircle, CheckCircle2, Wifi, WifiOff, Unplug,
} from "lucide-react";

import { API_URL, SSE_URL, REFRESH_INTERVAL_MS } from "../constants/api";
import { formatDateTime } from "../utils/greenhouse";
import {
  MetricCard, RainGauge, SoilMoisture,
  LightHours, ActuatorPanel, MpcControl,
} from "../components/greenhouse";

const ENV_METRICS = (d) => [
  { icon: Thermometer, label: "Suhu", value: d.suhu, unit: "°C",
    sub: d.suhu > 35 ? "⚠ Terlalu panas" : d.suhu < 18 ? "Dingin" : "Normal",
    iconClass: "text-gh-rose", accent: "bg-gh-blush" },
  { icon: Droplets, label: "Humidity Udara", value: d.humidity_udara, unit: "%",
    sub: d.humidity_udara > 80 ? "Lembap tinggi" : "Normal",
    iconClass: "text-gh-rose", accent: "bg-gh-rose-50" },
  { icon: Sun, label: "Cahaya", value: d.cahaya, unit: "%",
    sub: "Intensitas sensor", iconClass: "text-gh-rose", accent: "bg-gh-blush" },
  { icon: Wind, label: "Fan PWM", value: d.fan_pwm, unit: "",
    sub: `MPC: ${d.fan_mpc_control}%`, iconClass: "text-gh-rose", accent: "bg-gh-rose-50" },
];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [iotHealthy, setIotHealthy] = useState(true);
  const sseRef = useRef(null);
  const reconnectRef = useRef(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}?latest=true`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setIotHealthy(json.data.iot_healthy ?? true);
        setLastFetch(new Date());
      } else {
        setError("Data tidak tersedia dari server.");
      }
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  }, []);

  const connectSSE = useCallback(() => {
    if (sseRef.current) sseRef.current.close();
    const es = new EventSource(SSE_URL);
    sseRef.current = es;
    es.onopen = () => setSseConnected(true);
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "connected") return;
        setData(parsed);
        setIotHealthy(true);
        setLastFetch(new Date());
        setLoading(false);
        setError(null);
      } catch {}
    };
    es.onerror = () => {
      setSseConnected(false);
      es.close();
      sseRef.current = null;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      reconnectRef.current = setTimeout(connectSSE, 5000);
    };
  }, []);

  useEffect(() => {
    fetchData();
    connectSSE();
    const pollId = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => {
      clearInterval(pollId);
      if (sseRef.current) sseRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [fetchData, connectSSE]);

  return (
    <div className="min-h-screen bg-[#fef7fa]">
      <nav className="bg-white border-b border-gh-blush sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gh-rose rounded-xl flex items-center justify-center text-white">
              <Leaf size={20} strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Greenhouse Monitor</h1>
              <p className="text-xs text-slate-500">Sistem Monitoring & Kontrol Otomatis</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              iotHealthy
                ? sseConnected
                  ? "bg-gh-rose-50 border-gh-rose-200 text-gh-rose"
                  : "bg-gh-blush border-gh-blush text-gh-pink"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {iotHealthy
                ? (sseConnected ? <Wifi size={14} /> : <WifiOff size={14} />)
                : <Unplug size={14} />}
              {iotHealthy
                ? (sseConnected ? "SSE Live" : "Polling")
                : "IoT PROBLEM"}
            </div>
            {lastFetch && (
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                {lastFetch.toLocaleTimeString("id-ID")}
              </span>
            )}
            <Link
              href="/history"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gh-blush bg-white text-slate-700 hover:bg-gh-rose-50 transition"
            >
              <History size={14} />
              History
            </Link>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gh-blush bg-white text-slate-700 hover:bg-gh-rose-50 transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-4 pb-8">
        {!iotHealthy && data && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-700">
            <div className="flex items-center gap-2">
              <Unplug size={18} />
              <strong>IoT Device Problem</strong>
            </div>
            <p className="text-sm mt-1 text-red-600">
              Tidak ada update dari ESP32 selama lebih dari 5 menit. Kemungkinan: ESP32 mati, WiFi disconnect, power supply/lampu mati, atau kabel terputus.
            </p>
          </div>
        )}

        {loading && !data && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
            <div className="w-10 h-10 border-2 border-gh-blush border-t-gh-rose rounded-full animate-spin" />
            <span className="text-sm">Mengambil data sensor...</span>
          </div>
        )}

        {error && !data && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700 mt-4">
            <AlertTriangle size={24} className="mx-auto mb-2" />
            <p className="font-semibold">Koneksi Gagal</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gh-blush shadow-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${iotHealthy ? (sseConnected ? "bg-gh-rose animate-pulse" : "bg-gh-pink") : "bg-red-500 animate-pulse"}`} />
              <span className="text-xs text-slate-500 font-medium">
                Device <strong className="text-slate-700">#</strong>{data.id}
              </span>
              <span className="text-gh-blush">·</span>
              <Clock size={12} className="text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">{formatDateTime(data.datetime)} WIB</span>

              <div className="flex items-center gap-2 ml-auto">
                {data.dht_error && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    <AlertCircle size={12} /> DHT Error
                  </span>
                )}
                {data.soil1_error && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    <AlertCircle size={12} /> Soil1 Error
                  </span>
                )}
                {!data.dht_error && !data.soil1_error && iotHealthy && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gh-rose-100 text-gh-rose text-xs font-semibold">
                    <CheckCircle2 size={12} /> All OK
                  </span>
                )}
              </div>
            </div>

            <section>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Kondisi Lingkungan</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {ENV_METRICS(data).map((m) => (
                  <MetricCard key={m.label} {...m} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Sensor Kalibrasi</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <RainGauge pct={data.hujan_percent} status={data.hujan_status} />
                <SoilMoisture pct={data.kelembapan_tanah} pct2={data.soil2_percent} />
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Cahaya & Aktuator</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <LightHours
                  natural={data.natural_light_hours}
                  lamp={data.lamp_light_hours}
                  total={data.total_light_hours}
                  target={data.target_light_hours}
                />
                <ActuatorPanel data={data} />
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Parameter MPC</h2>
              <MpcControl data={data} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}