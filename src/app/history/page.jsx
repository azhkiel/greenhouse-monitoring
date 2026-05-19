"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, RefreshCw, AlertTriangle,
  ChevronLeft, ChevronRight, Search, Leaf,
} from "lucide-react";

import { API_URL, REFRESH_INTERVAL_MS, HISTORY_PAGE_SIZE } from "../../constants/api";
import { formatDateShort } from "../../utils/greenhouse";

function StatusBadge({ value }) {
  const on = value === "ON";
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${on ? "bg-gh-rose-100 text-gh-rose" : "bg-gh-blush text-gh-pink"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${on ? "bg-gh-rose" : "bg-gh-pink"}`} />
      {value ?? "—"}
    </span>
  );
}

function ErrorBadge({ val }) {
  return (
    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${val ? "bg-red-100 text-red-700" : "bg-gh-blush text-gh-pink"}`}>
      {val ? "ERR" : "OK"}
    </span>
  );
}

export default function HistoryPage() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (json.success && json.data?.length) {
        setAllData(json.data);
        setLastFetch(new Date());
      } else {
        setError("Data tidak tersedia.");
      }
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allData;
    return allData.filter((row) => {
      const dt = formatDateShort(row.datetime).toLowerCase();
      return dt.includes(q) || String(row.id).includes(q) || String(row.suhu).includes(q);
    });
  }, [allData, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / HISTORY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * HISTORY_PAGE_SIZE, safePage * HISTORY_PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="min-h-screen bg-[#fef7fa]">
      <nav className="bg-white border-b border-gh-blush sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-lg border border-gh-blush bg-white hover:bg-gh-rose-50 transition text-gh-pink">
              <ArrowLeft size={16} />
            </Link>
            <div className="w-10 h-10 bg-gh-rose rounded-xl flex items-center justify-center text-white">
              <Leaf size={20} strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Riwayat Data</h1>
              <p className="text-xs text-gh-pink">{allData.length} record</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lastFetch && (
              <span className="text-[11px] text-gh-pink hidden sm:inline">
                {lastFetch.toLocaleTimeString("id-ID")}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gh-blush bg-white text-gh-pink hover:bg-gh-rose-50 transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-4 pb-8">
        <div className="mb-3 flex items-center gap-2 max-w-xs">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gh-pink" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tanggal / ID…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gh-blush rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gh-rose/30 focus:border-gh-rose transition"
            />
          </div>
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-gh-pink hover:text-gh-rose transition">Reset</button>
          )}
        </div>

        {loading && allData.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-gh-pink">
            <div className="w-10 h-10 border-2 border-gh-blush border-t-gh-rose rounded-full animate-spin" />
            <span className="text-sm">Mengambil riwayat...</span>
          </div>
        )}

        {error && allData.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
            <AlertTriangle size={24} className="mx-auto mb-2" />
            <p className="font-semibold">Koneksi Gagal</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {allData.length > 0 && (
          <div className="bg-white border border-gh-blush rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-left text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">#</th>
                    <th className="px-2 py-2 text-left text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">Waktu</th>
                    <th className="px-2 py-2 text-left text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">ID</th>
                    <th className="px-2 py-2 text-right text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">Suhu</th>
                    <th className="px-2 py-2 text-right text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">Humid</th>
                    <th className="px-2 py-2 text-right text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">Tanah1</th>
                    <th className="px-2 py-2 text-right text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">Tanah2</th>
                    <th className="px-2 py-2 text-right text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">Cahaya</th>
                    <th className="px-2 py-2 text-right text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">Hujan</th>
                    <th className="px-2 py-2 text-center text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">DHT</th>
                    <th className="px-2 py-2 text-center text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">Soil1</th>
                    <th className="px-2 py-2 text-center text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">Fan</th>
                    <th className="px-2 py-2 text-center text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">P.Air</th>
                    <th className="px-2 py-2 text-center text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">P.Nut</th>
                    <th className="px-2 py-2 text-center text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">Humid</th>
                    <th className="px-2 py-2 text-center text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">Lamp</th>
                    <th className="px-2 py-2 text-right text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">PWM</th>
                    <th className="px-2 py-2 text-right text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">F.MPC</th>
                    <th className="px-2 py-2 text-right text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">S.MPC</th>
                    <th className="px-2 py-2 text-right text-[10px] uppercase tracking-widest font-bold text-gh-pink bg-gh-rose-50">P.ON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gh-blush">
                  {pageData.map((row, i) => {
                    const rowNum = (safePage - 1) * HISTORY_PAGE_SIZE + i + 1;
                    const isLatest = safePage === 1 && i === 0;
                    return (
                      <tr key={row.datetime + "-" + i} className={`${isLatest ? "bg-gh-rose-50/80" : "hover:bg-gh-blush"} transition-colors`}>
                        <td className="px-2 py-2 text-xs text-gh-pink">{rowNum}</td>
                        <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                          {isLatest && <span className="w-1.5 h-1.5 bg-gh-rose rounded-full animate-pulse inline-block mr-1" />}
                          {formatDateShort(row.datetime)}
                        </td>
                        <td className="px-2 py-2 text-xs font-mono text-gh-pink">{row.id}</td>
                        <td className={`px-2 py-2 text-xs text-right font-semibold ${row.suhu > 35 ? "text-red-600" : "text-slate-700"}`}>{row.suhu ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-right text-slate-600">{row.humidity_udara ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-right text-slate-600">{row.kelembapan_tanah ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-right text-slate-600">{row.soil2_percent ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-right text-slate-600">{row.cahaya ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-right text-slate-600">{row.hujan_percent ?? "—"}</td>
                        <td className="px-2 py-2 text-center"><ErrorBadge val={row.dht_error} /></td>
                        <td className="px-2 py-2 text-center"><ErrorBadge val={row.soil1_error} /></td>
                        <td className="px-2 py-2 text-center"><StatusBadge value={row.fan_status} /></td>
                        <td className="px-2 py-2 text-center"><StatusBadge value={row.pump_air_status} /></td>
                        <td className="px-2 py-2 text-center"><StatusBadge value={row.pump_nutrisi_status} /></td>
                        <td className="px-2 py-2 text-center"><StatusBadge value={row.pump_humid_status} /></td>
                        <td className="px-2 py-2 text-center"><StatusBadge value={row.lamp_status} /></td>
                        <td className="px-2 py-2 text-xs text-right text-slate-600">{row.fan_pwm ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-right text-slate-600">{row.fan_mpc_control ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-right text-slate-600">{row.soil_mpc_control ?? "—"}</td>
                        <td className="px-2 py-2 text-xs text-right text-slate-600">{row.pump_on_time ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gh-blush bg-gh-rose-50/60">
              <span className="text-xs text-gh-pink">
                {((safePage - 1) * HISTORY_PAGE_SIZE) + 1}–{Math.min(safePage * HISTORY_PAGE_SIZE, filtered.length)} dari {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gh-blush bg-white text-gh-pink hover:bg-gh-rose-50 active:scale-95 transition disabled:opacity-40">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push("..."); acc.push(p); return acc; }, [])
                  .map((item, i) =>
                    item === "..." ? (
                      <span key={`e-${i}`} className="text-gh-pink text-xs px-1">…</span>
                    ) : (
                      <button key={item} onClick={() => setPage(item)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition active:scale-95 ${item === safePage ? "bg-gh-rose text-white border border-gh-rose" : "border border-gh-blush bg-white text-gh-pink hover:bg-gh-rose-50"}`}>
                        {item}
                      </button>
                    )
                  )}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gh-blush bg-white text-gh-pink hover:bg-gh-rose-50 active:scale-95 transition disabled:opacity-40">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && allData.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16 text-gh-pink">
            <Search size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">Tidak ada hasil untuk "{search}"</p>
          </div>
        )}
      </main>
    </div>
  );
}