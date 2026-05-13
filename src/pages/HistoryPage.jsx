import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, RefreshCw, AlertTriangle,
  ChevronLeft, ChevronRight, Search, Leaf,
} from "lucide-react";

import { API_URL, REFRESH_INTERVAL_MS, HISTORY_PAGE_SIZE } from "../constants/api";
import { formatDateTime } from "../utils/greenhouse";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ value }) {
  const on = value === "ON";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        on
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${on ? "bg-emerald-500" : "bg-slate-400"}`} />
      {value ?? "—"}
    </span>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-3 py-2.5 text-sm text-slate-700 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-3 py-3 text-left text-[11px] uppercase tracking-widest font-bold text-slate-400 bg-slate-50 ${className}`}
    >
      {children}
    </th>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const navigate = useNavigate();

  const [allData, setAllData]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(API_URL);
      const json = await res.json();
      if (json.success && json.data?.length) {
        // Urutkan dari paling baru ke paling lama
        const sorted = [...json.data].sort(
          (a, b) => new Date(b.datetime) - new Date(a.datetime)
        );
        setAllData(sorted);
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

  // ── Filter & Pagination ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allData;
    return allData.filter((row) => {
      const dt = formatDateTime(row.datetime).toLowerCase();
      return (
        dt.includes(q) ||
        String(row.id).toLowerCase().includes(q) ||
        String(row.suhu).includes(q)
      );
    });
  }, [allData, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / HISTORY_PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageData   = filtered.slice(
    (safePage - 1) * HISTORY_PAGE_SIZE,
    safePage * HISTORY_PAGE_SIZE
  );

  // Reset ke halaman 1 kalau search berubah
  useEffect(() => { setPage(1); }, [search]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-16">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-7">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition text-slate-600"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="w-11 h-11 bg-emerald-700 rounded-xl flex items-center justify-center text-white shrink-0">
            <Leaf size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Riwayat Data Sensor
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {allData.length} record tersedia — data terbaru ditampilkan pertama
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
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="mb-4 flex items-center gap-2 max-w-xs">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tanggal / device ID…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs text-slate-400 hover:text-slate-600 transition"
          >
            Reset
          </button>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && allData.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
          <div className="w-9 h-9 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-sm">Mengambil riwayat data...</span>
        </div>
      )}

      {/* ── Error ── */}
      {error && allData.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-red-700">
          <AlertTriangle size={20} className="mx-auto mb-2" />
          <p className="font-semibold">Koneksi Gagal</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* ── Table ── */}
      {allData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Waktu</Th>
                  <Th>Device</Th>
                  <Th className="text-right">Suhu (°C)</Th>
                  <Th className="text-right">Humid Udara (%)</Th>
                  <Th className="text-right">Cahaya (%)</Th>
                  <Th className="text-right">Hujan (%)</Th>
                  <Th className="text-right">Tanah (%)</Th>
                  <Th className="text-right">Fan PWM</Th>
                  <Th>Fan</Th>
                  <Th>Pompa Air</Th>
                  <Th>Pompa Nutrisi</Th>
                  <Th>Peltier</Th>
                  <Th>Lampu</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageData.map((row, i) => {
                  const rowNum = (safePage - 1) * HISTORY_PAGE_SIZE + i + 1;
                  // Baris paling pertama (paling baru) diberi highlight
                  const isLatest = safePage === 1 && i === 0;
                  return (
                    <tr
                      key={row.datetime + "-" + i}
                      className={isLatest ? "bg-emerald-50/60" : "hover:bg-slate-50 transition-colors"}
                    >
                      <Td className="text-slate-400 text-xs">{rowNum}</Td>
                      <Td>
                        <span className="flex items-center gap-1.5">
                          {isLatest && (
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                          )}
                          <span className={isLatest ? "font-semibold text-emerald-700" : ""}>
                            {formatDateTime(row.datetime)}
                          </span>
                        </span>
                      </Td>
                      <Td className="font-mono text-xs">{row.id}</Td>
                      <Td className={`text-right font-semibold ${row.suhu > 35 ? "text-red-600" : "text-slate-700"}`}>
                        {row.suhu ?? "—"}
                      </Td>
                      <Td className="text-right">{row.humidity_udara ?? "—"}</Td>
                      <Td className="text-right">{row.cahaya ?? "—"}</Td>
                      <Td className="text-right">{row.hujan_percent ?? "—"}</Td>
                      <Td className="text-right">{row.kelembapan_tanah ?? "—"}</Td>
                      <Td className="text-right">{row.fan_pwm ?? "—"}</Td>
                      <Td><StatusBadge value={row.fan_status} /></Td>
                      <Td><StatusBadge value={row.pump_air_status} /></Td>
                      <Td><StatusBadge value={row.pump_nutrisi_status} /></Td>
                      <Td><StatusBadge value={row.pump_peltier_status} /></Td>
                      <Td><StatusBadge value={row.lamp_status} /></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/60">
            <span className="text-xs text-slate-500">
              Menampilkan {((safePage - 1) * HISTORY_PAGE_SIZE) + 1}–{Math.min(safePage * HISTORY_PAGE_SIZE, filtered.length)} dari {filtered.length} data
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`ellipsis-${i}`} className="text-slate-400 text-xs px-1">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition active:scale-95 ${
                        item === safePage
                          ? "bg-emerald-600 text-white border border-emerald-600"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty (after filter) ── */}
      {!loading && allData.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Search size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Tidak ada hasil untuk "{search}"</p>
          <p className="text-sm mt-1">Coba kata kunci lain</p>
        </div>
      )}
    </div>
  );
}
