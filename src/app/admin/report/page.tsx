"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  TrendingUp, TrendingDown, DollarSign, Receipt,
  Download, ChevronDown, ArrowUpRight, ArrowDownRight,
  FileSpreadsheet, FileText, Filter, RefreshCw,
  Gamepad2, ChevronLeft, ChevronRight,
} from "lucide-react";

type Period = "today" | "week" | "month" | "year" | "custom";

const cardStyle = { background: "rgba(11,15,32,0.85)", border: "1px solid #1c2540" };

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({ label, value, sub, icon: Icon, accent, trend }: {
  label: string; value: string; sub?: string; icon: any; accent: string; trend?: "up" | "down";
}) {
  return (
    <div style={cardStyle} className="rounded-2xl p-4 sm:p-5 relative overflow-hidden">
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at 80% 20%, ${accent}14, transparent 60%)` }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: "#94a3b8" }}>{label}</p>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}1a` }}>
            <Icon size={16} style={{ color: accent }} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-white leading-none mb-1">{value}</p>
        {sub && <p className="text-[11px] mt-1" style={{ color: "#94a3b8" }}>{sub}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold"
            style={{ color: trend === "up" ? "#34d399" : "#f87171" }}>
            {trend === "up" ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {trend === "up" ? "เพิ่มขึ้น" : "ลดลง"}
          </div>
        )}
      </div>
    </div>
  );
}

// Mini bar chart
function MiniBarChart({ data }: { data: { label: string; revenue: number; cost: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.revenue));
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height: 80 }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full flex gap-0.5 items-end" style={{ height: 70 }}>
            <div className="flex-1 rounded-t-sm transition-all"
              style={{ height: `${maxVal > 0 ? (d.revenue / maxVal) * 100 : 0}%`, background: "linear-gradient(180deg,#38bdf8,#0e7490)", minHeight: 2 }} />
            <div className="flex-1 rounded-t-sm transition-all"
              style={{ height: `${maxVal > 0 ? (d.cost / maxVal) * 100 : 0}%`, background: "linear-gradient(180deg,#818cf8,#4338ca)", minHeight: 2 }} />
          </div>
          <p className="text-[9px] truncate w-full text-center" style={{ color: "#64748b" }}>{d.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function FinancialDashboard() {
  const { token } = useAdminAuth();
  const [period, setPeriod]         = useState<Period>("month");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "failed">("all");
  const [page, setPage]             = useState(1);

  const [summary, setSummary]         = useState<any>(null);
  const [financial, setFinancial]     = useState<any>(null);
  const [transactions, setTransactions] = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [exporting, setExporting]     = useState(false);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ period, ...(dateFrom && { dateFrom }), ...(dateTo && { dateTo }) });
      const tp = new URLSearchParams({ period, page: String(page), limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(dateFrom && { dateFrom }), ...(dateTo && { dateTo }),
      });
      const headers = { Authorization: `Bearer ${token}` };
      const [sRes, fRes, tRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/summary?${p}`,      { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/financial?${p}`,    { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/transactions?${tp}`,{ headers }),
      ]);
      setSummary(sRes.data);
      setFinancial(fRes.data);
      setTransactions(tRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, period, dateFrom, dateTo, statusFilter, page]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleExport = async (format: "csv" | "xlsx") => {
    if (!token) return;
    setExporting(true);
    try {
      const p = new URLSearchParams({ period, format, ...(dateFrom && { dateFrom }), ...(dateTo && { dateTo }) });
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/export?${p}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${period}_${new Date().toISOString().slice(0,10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Export ไม่สำเร็จ"); }
    finally { setExporting(false); setExportOpen(false); }
  };

  // Build daily chart data
  const chartData = summary?.daily
    ? Object.entries(summary.daily).slice(-7).map(([date, v]: [string, any]) => ({
        label: new Date(date).toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
        revenue: v.revenue,
        cost: 0,
      }))
    : [];

  const periodLabel: Record<Period, string> = {
    today: "วันนี้", week: "สัปดาห์นี้", month: "เดือนนี้", year: "ปีนี้", custom: "กำหนดเอง",
  };

  const rev     = summary?.revenue?.total ?? 0;
  const cost    = summary?.cost ?? 0;
  const profit  = summary?.profit ?? 0;
  const vat     = summary?.revenue?.vat ?? 0;
  const margin  = rev > 0 ? ((profit / rev) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen p-3 sm:p-5 space-y-5"
      style={{ background: "linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)", fontFamily: "'Noto Sans Thai',sans-serif" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-widest uppercase font-mono mb-1" style={{ color: "#3a4a6a" }}>
            Super Admin · Financial Report
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            รายงานการเงิน{" "}
            <span style={{ background: "linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {periodLabel[period]}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period */}
          <div className="flex gap-1 p-1 rounded-xl" style={cardStyle}>
            {(["today","week","month","year"] as Period[]).map(p => (
              <button key={p} onClick={() => { setPeriod(p); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={period === p
                  ? { background: "rgba(88,50,210,0.3)", color: "#a5b4fc", border: "1px solid rgba(129,140,248,0.4)" }
                  : { color: "#94a3b8" }}>
                {periodLabel[p]}
              </button>
            ))}
          </div>
          {/* Refresh */}
          <button onClick={fetchAll} disabled={loading}
            className="p-2 rounded-xl disabled:opacity-50"
            style={cardStyle}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} style={{ color: "#64748b" }} />
          </button>
          {/* Export */}
          <div className="relative">
            <button onClick={() => setExportOpen(v => !v)} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399" }}>
              {exporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
              Export
              <ChevronDown size={12} className={`transition-transform ${exportOpen ? "rotate-180" : ""}`} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 rounded-xl overflow-hidden shadow-2xl"
                style={{ background: "rgba(8,10,22,0.98)", border: "1px solid #1c2540", minWidth: 200 }}>
                <button onClick={() => handleExport("xlsx")}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-white hover:bg-white/5 transition">
                  <FileSpreadsheet size={14} style={{ color: "#34d399" }} /> Export .xlsx (Excel)
                </button>
                <div style={{ borderTop: "1px solid #1c2540" }}>
                  <button onClick={() => handleExport("csv")}
                    className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-white hover:bg-white/5 transition">
                    <FileText size={14} style={{ color: "#38bdf8" }} /> Export .csv
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom date range */}
      {period === "custom" && (
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="text-[10px] mb-1 block" style={{ color: "#64748b" }}>ตั้งแต่</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1c2540" }} />
          </div>
          <div>
            <label className="text-[10px] mb-1 block" style={{ color: "#64748b" }}>ถึง</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1c2540" }} />
          </div>
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-5 animate-pulse" style={cardStyle}>
              <div className="h-3 w-20 rounded mb-3" style={{ background: "#1c2540" }} />
              <div className="h-7 w-28 rounded mb-2" style={{ background: "#1c2540" }} />
              <div className="h-2 w-16 rounded" style={{ background: "#1c2540" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="กำไรสุทธิ"  value={`฿${fmt(profit)}`} sub={`Margin ${margin}%`}                              icon={TrendingUp}   accent="#38bdf8" trend="up"   />
          <StatCard label="รายได้รวม"  value={`฿${fmt(rev)}`}    sub={`${summary?.orders?.total ?? 0} ออเดอร์`}        icon={DollarSign}   accent="#818cf8" trend="up"   />
          <StatCard label="ต้นทุนรวม"  value={`฿${fmt(cost)}`}   sub={`${rev > 0 ? ((cost/rev)*100).toFixed(1) : 0}% ของรายได้`} icon={TrendingDown} accent="#f472b6" />
          <StatCard label="VAT 7%"     value={`฿${fmt(vat)}`}    sub={`Success ${summary?.orders?.successRate ?? 0}%`} icon={Receipt}      accent="#a78bfa" />
        </div>
      )}

      {/* Chart + Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Chart */}
        <div className="lg:col-span-3 rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-white">รายได้รายวัน</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded" style={{ background: "#38bdf8" }} /><span className="text-[10px]" style={{ color: "#64748b" }}>รายได้</span></div>
            </div>
          </div>
          {loading ? (
            <div className="animate-pulse rounded-xl" style={{ height: 80, background: "#1c2540" }} />
          ) : chartData.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: "#64748b" }}>ยังไม่มีข้อมูล</p>
          ) : (
            <MiniBarChart data={chartData} />
          )}
        </div>

        {/* VAT Breakdown */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={cardStyle}>
          <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Receipt size={14} style={{ color: "#a78bfa" }} /> รายละเอียดภาษี (VAT)
          </p>
          {loading ? (
            <div className="space-y-3">{Array.from({length:3}).map((_,i) => (
              <div key={i} className="animate-pulse h-8 rounded" style={{ background: "#1c2540" }} />
            ))}</div>
          ) : (
            <div className="space-y-4">
              {[
                { label: "รายได้รวม (incl. VAT)", value: rev,                  color: "#818cf8" },
                { label: "VAT 7%",                 value: vat,                  color: "#f472b6" },
                { label: "รายได้ (excl. VAT)",     value: summary?.revenue?.exVat ?? 0, color: "#38bdf8" },
                { label: "กำไรสุทธิ",               value: profit,              color: "#34d399" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-xs" style={{ color: "#94a3b8" }}>{item.label}</p>
                    <p className="text-sm font-bold" style={{ color: item.color }}>฿{fmt(item.value)}</p>
                  </div>
                  <div className="w-full h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${rev > 0 ? Math.min(100, (item.value / rev) * 100) : 0}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* By Game */}
      {financial?.byGame?.length > 0 && (
        <div className="rounded-2xl p-5" style={cardStyle}>
          <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Gamepad2 size={14} style={{ color: "#38bdf8" }} /> รายได้แยกตามเกม
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #1c2540" }}>
                  {["เกม", "รายได้", "ต้นทุน", "กำไร", "ออเดอร์"].map(h => (
                    <th key={h} className="pb-2 text-left text-[11px] font-semibold pr-4 whitespace-nowrap" style={{ color: "#64748b" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {financial.byGame.map((g: any, i: number) => (
                  <tr key={i} style={{ borderBottom: "1px solid #0d1525" }}>
                    <td className="py-2.5 pr-4 font-semibold text-white">{g.game}</td>
                    <td className="py-2.5 pr-4 font-bold" style={{ color: "#7dd3fc" }}>฿{fmt(g.revenue)}</td>
                    <td className="py-2.5 pr-4" style={{ color: "#f9a8d4" }}>฿{fmt(g.cost)}</td>
                    <td className="py-2.5 pr-4 font-bold" style={{ color: g.profit >= 0 ? "#34d399" : "#f87171" }}>฿{fmt(g.profit)}</td>
                    <td className="py-2.5 pr-4" style={{ color: "#94a3b8" }}>{g.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid #1c2540" }}>
          <p className="text-sm font-bold text-white">รายการธุรกรรม</p>
          <div className="flex items-center gap-2">
            <Filter size={12} style={{ color: "#64748b" }} />
            {(["all", "completed", "failed"] as const).map(f => (
              <button key={f} onClick={() => { setStatusFilter(f); setPage(1); }}
                className="px-3 py-1 rounded-full text-xs font-semibold transition"
                style={statusFilter === f
                  ? f === "all"
                    ? { background: "rgba(88,50,210,0.25)", color: "#a5b4fc", border: "1px solid rgba(129,140,248,0.4)" }
                    : f === "completed"
                    ? { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.35)" }
                    : { background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.35)" }
                  : { color: "#64748b", border: "1px solid #1c2540" }}>
                {{ all: "ทั้งหมด", completed: "สำเร็จ", failed: "ล้มเหลว" }[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #1c2540", background: "rgba(5,7,18,0.5)" }}>
                {["Order ID","วันที่","เกม / แพ็กเกจ","UID","รายได้","VAT 7%","ต้นทุน","กำไร","วิธีชำระ","สถานะ"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold whitespace-nowrap" style={{ color: "#64748b" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i) => (
                <tr key={i} style={{ borderBottom: "1px solid #0d1525" }}>
                  {Array.from({length:10}).map((_,j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 rounded animate-pulse" style={{ background: "#1c2540", width: j === 2 ? 120 : 60 }} />
                    </td>
                  ))}
                </tr>
              )) : transactions?.data?.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-sm" style={{ color: "#64748b" }}>ไม่พบรายการ</td></tr>
              ) : transactions?.data?.map((r: any, i: number) => (
                <tr key={i} className="hover:bg-white/[0.02] transition" style={{ borderBottom: "1px solid #0d1525" }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#67e8f9" }}>{r.orderId}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#94a3b8" }}>
                    {new Date(r.createdAt).toLocaleDateString("th-TH", { day:"numeric",month:"short",year:"2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white text-xs">{r.gameName}</p>
                    <p className="text-[10px] truncate max-w-[120px]" style={{ color: "#64748b" }}>{r.packageName}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#94a3b8" }}>{r.uid}</td>
                  <td className="px-4 py-3 font-bold whitespace-nowrap text-xs" style={{ color: "#7dd3fc" }}>฿{fmt(r.revenue)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "#c4b5fd" }}>฿{fmt(r.vat)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "#f9a8d4" }}>฿{fmt(r.cost)}</td>
                  <td className="px-4 py-3 font-bold whitespace-nowrap text-xs" style={{ color: r.profit >= 0 ? "#34d399" : "#f87171" }}>฿{fmt(r.profit)}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#94a3b8" }}>{r.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                      style={r.status === "completed"
                        ? { background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }
                        : { background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: r.status === "completed" ? "#34d399" : "#f87171" }} />
                      {r.status === "completed" ? "สำเร็จ" : "ล้มเหลว"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {transactions?.pagination && transactions.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid #1c2540" }}>
            <p className="text-xs" style={{ color: "#64748b" }}>
              {transactions.pagination.page}/{transactions.pagination.totalPages} · {transactions.pagination.total.toLocaleString()} รายการ
            </p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-1.5 rounded-lg disabled:opacity-30"
                style={{ border: "1px solid #1c2540", color: "#94a3b8" }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= transactions.pagination.totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30"
                style={{ border: "1px solid #1c2540", color: "#94a3b8" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
