"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  ArrowUpRight, ArrowDownRight, Bell, Search, ChevronDown,
  Eye, MoreVertical, Wallet, ShoppingCart,
  Users, Clock, AlertTriangle, Zap, X
} from "lucide-react";

// ── i18n ──────────────────────────────────────────────────────────
const T = {
  th: {
    dashboard: "Dashboard", updatedAt: "อัปเดตล่าสุด",
    todaySales: "รายได้วันนี้", totalOrders: "ออเดอร์วันนี้",
    newMembers: "สมาชิกใหม่", successRate: "อัตราสำเร็จ",
    pendingTx: "รอดำเนินการ", failedTopup: "เติมไม่สำเร็จ",
    fromYesterday: "vs เมื่อวาน",
    salesChart: "ยอดขาย", recentOrders: "ธุรกรรมล่าสุด",
    viewAll: "ดูทั้งหมด", quickActions: "Quick Actions",
    systemStatus: "System Status", allOnline: "All Systems Operational",
    topGames: "เกมยอดนิยม", manageGame: "จัดการเกม",
    success: "สำเร็จ", processing: "กำลังเติม", waiting: "รอชำระ", error: "ล้มเหลว",
    lastCheckedLabel: "ตรวจสอบล่าสุด",
    orders: "ออเดอร์", stock: "Stock", today: "ยอดวันนี้", minAgo: "นาทีที่แล้ว",
    qa1: "เติมเกม Manual", qa1s: "เติมเกมด้วยมือ",
    qa2: "เพิ่มเกมใหม่", qa2s: "เพิ่มเกมเข้าสู่ระบบ",
    qa3: "สร้างโปรโมชั่น", qa3s: "โค้ดส่วนลด",
    qa4: "เพิ่มแอดมิน", qa4s: "เพิ่มผู้ดูแลระบบ",
    qa5: "Export รายงาน", qa5s: "ดาวน์โหลด Excel",
    qa6: "Retry คิวค้าง", qa6s: "รีทรายคิวล้มเหลว",
    open: "เปิดใช้งาน",
    period3d: "3 วัน", period7d: "7 วัน", period30d: "30 วัน", periodY: "ปีนี้",
    allOrders: "รายการทั้งหมด", searchPh: "ค้นหา UID, ธุรกรรม...",
    noOrders: "ยังไม่มีออเดอร์", noGames: "ยังไม่มีข้อมูลเกม",
  },
  en: {
    dashboard: "Dashboard", updatedAt: "Last updated",
    todaySales: "Today Revenue", totalOrders: "Today Orders",
    newMembers: "New Members", successRate: "Success Rate",
    pendingTx: "Pending", failedTopup: "Failed Topup",
    fromYesterday: "vs yesterday",
    salesChart: "Sales", recentOrders: "Recent Transactions",
    viewAll: "View All", quickActions: "Quick Actions",
    systemStatus: "System Status", allOnline: "All Systems Operational",
    topGames: "Popular Games", manageGame: "Manage",
    success: "Success", processing: "Processing", waiting: "Waiting", error: "Failed",
    lastCheckedLabel: "Last checked",
    orders: "orders", stock: "Stock", today: "Today", minAgo: "min ago",
    qa1: "Manual Topup", qa1s: "Top up manually",
    qa2: "Add Game", qa2s: "Add new game",
    qa3: "Create Promo", qa3s: "Discount codes",
    qa4: "Add Admin", qa4s: "Add administrator",
    qa5: "Export", qa5s: "Download Excel",
    qa6: "Retry Queue", qa6s: "Retry failed queue",
    open: "Active",
    period3d: "3D", period7d: "7D", period30d: "30D", periodY: "Year",
    allOrders: "All Orders", searchPh: "Search UID, transaction...",
    noOrders: "No orders yet", noGames: "No game data",
  },
};

const GAME_LOGOS: Record<string, { bg: string; icon: string }> = {
  "Mobile Legends": { bg: "#1a3a5c", icon: "⚔️" },
  "Free Fire":      { bg: "#3a1a1a", icon: "🔥" },
  "PUBG Mobile":    { bg: "#2a2a1a", icon: "🎯" },
  "Genshin Impact": { bg: "#1a1a3a", icon: "✨" },
  "ROV":            { bg: "#1a3a1a", icon: "🏆" },
};

type TxStatus = "success" | "processing" | "pending" | "failed";
const ST: Record<TxStatus, { color: string; bg: string; border: string }> = {
  success:    { color: "#34d399", bg: "rgba(52,211,153,0.15)",  border: "rgba(52,211,153,0.35)"  },
  processing: { color: "#38bdf8", bg: "rgba(56,189,248,0.15)",  border: "rgba(56,189,248,0.35)"  },
  pending:    { color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.35)"  },
  failed:     { color: "#f87171", bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.35)" },
};

function stockColor(p: number) { return p >= 80 ? "#34d399" : p >= 50 ? "#f59e0b" : "#f87171"; }
const cardBg = { background: "rgba(11,15,32,0.85)", border: "1px solid #1c2540" };
function fmt(n: number) { return n.toLocaleString("th-TH"); }

function LineChartSVG({ values, labels }: { values: number[]; labels: string[] }) {
  const W = 560, H = 100, pX = 4, pY = 10;
  const max = Math.max(...values), min = Math.min(...values), range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: pX + (i / (values.length - 1)) * (W - pX * 2),
    y: pY + (1 - (v - min) / range) * (H - pY * 2),
  }));
  function bez(p: { x: number; y: number }[]) {
    return p.map((pt, i) => {
      if (i === 0) return `M${pt.x},${pt.y}`;
      const q = p[i - 1]; const cx = (q.x + pt.x) / 2;
      return `C${cx},${q.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
    }).join(" ");
  }
  const path = bez(pts);
  const area = `${path} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
  const peak = pts.reduce((a, b) => b.y < a.y ? b : a);
  const step = Math.max(1, Math.floor(labels.length / 5));
  const sl = labels.filter((_, i) => i % step === 0 || i === labels.length - 1);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 90 }}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        {[.25,.5,.75].map(r => (
          <line key={r} x1={pX} y1={pY+r*(H-pY*2)} x2={W-pX} y2={pY+r*(H-pY*2)}
            stroke="#1c2540" strokeWidth={1} strokeDasharray="3,4" />
        ))}
        <path d={area} fill="url(#cg)" />
        <path d={path} fill="none" stroke="#38bdf8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={peak.x} cy={peak.y} r={4} fill="#38bdf8" stroke="rgba(11,15,32,0.9)" strokeWidth={2} />
      </svg>
      <div className="flex justify-between px-1 mt-1">
        {sl.map((l, i) => <span key={i} className="text-[9px]" style={{ color: "#3a4a6a" }}>{l}</span>)}
      </div>
    </div>
  );
}

function StatusBadge({ status, t }: { status: TxStatus; t: typeof T["th"] }) {
  const cfg = ST[status];
  const label = status === "success" ? t.success : status === "processing" ? t.processing
    : status === "pending" ? t.waiting : t.error;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
      {label}
    </span>
  );
}

type DisplayOrder = { id: string; uid: string; game: string; pkg: string; method: string; amount: number; status: TxStatus; min: number };

function OrderRow({ o, t }: { o: DisplayOrder; t: typeof T["th"] }) {
  const logo = GAME_LOGOS[o.game];
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition cursor-pointer"
      style={{ borderBottom: "1px solid #0d1525" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: logo?.bg ?? "#1c1c2a" }}>
        {logo?.icon ?? "🎮"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-white truncate">{o.game}</span>
          <span className="text-[10px] truncate" style={{ color: "#64748b" }}>· {o.pkg}</span>
        </div>
        <p className="text-[10px] mt-0.5 truncate" style={{ color: "#64748b" }}>
          {o.uid} · {o.min}{t.minAgo}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <p className="text-xs font-bold text-white">฿{fmt(o.amount)}</p>
        <StatusBadge status={o.status} t={t} />
      </div>
    </div>
  );
}

function AllOrdersModal({ onClose, t, orders }: { onClose: () => void; t: typeof T["th"]; orders: DisplayOrder[] }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ background: "rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: "#0d1420", border: "1px solid #1c2540" }}>
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid #1c2540" }}>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white">{t.allOrders}</p>
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#34d399" }} />Live
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "#64748b" }}><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {orders.length === 0
            ? <p className="text-center py-12 text-sm" style={{ color: "#64748b" }}>{t.noOrders}</p>
            : orders.map((o, i) => <OrderRow key={i} o={o} t={t} />)}
        </div>
      </div>
    </div>
  );
}

const systemServices = [
  { name: "API Server",      latency: "42ms",  ok: true  },
  { name: "Payment Gateway", latency: "210ms", ok: true  },
  { name: "Auto Top-up",     latency: "180ms", ok: true  },
  { name: "Database",        latency: "8ms",   ok: true  },
  { name: "CDN",             latency: "22ms",  ok: false },
];

export default function AdminDashboard() {
  const [lang, setLang]       = useState<"th" | "en">("th");
  const [period, setPeriod]   = useState<"3d" | "7d" | "30d" | "year">("7d");
  const [showAll, setShowAll] = useState(false);

  const [now, setNow] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
  });
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const { token } = useAdminAuth();
  const router = useRouter();
  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all`,
        { headers: { Authorization: `Bearer ${token}` } });
      setRawOrders(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [token]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayOrders   = rawOrders.filter(o => new Date(o.created_at) >= todayStart);
  const successOrders = rawOrders.filter(o => o.status === "completed");
  const pendingOrders = rawOrders.filter(o => o.status === "pending");
  const failedOrders  = rawOrders.filter(o => o.status === "failed");
  const todayRevenue  = todayOrders.filter(o => o.status === "completed").reduce((s,o) => s + Number(o.amount??0), 0);
  const successRate   = rawOrders.length > 0 ? ((successOrders.length/rawOrders.length)*100).toFixed(1) : "0.0";

  function buildChartData(days: number) {
    const map: Record<string, number> = {};
    for (let i = days-1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0);
      map[d.toDateString()] = 0;
    }
    rawOrders.filter(o => o.status==="completed").forEach(o => {
      const d = new Date(o.created_at); d.setHours(0,0,0,0);
      if (map[d.toDateString()] !== undefined) map[d.toDateString()] += Number(o.amount??0);
    });
    return Object.values(map);
  }

  const CHART_PERIODS = {
    "3d":   { lbTH:["เมื่อวาน-2","เมื่อวาน","วันนี้"],   lbEN:["2d ago","Yesterday","Today"],   v:buildChartData(3)   },
    "7d":   { lbTH:["จ","อ","พ","พฤ","ศ","ส","อา"],      lbEN:["M","T","W","T","F","S","S"],    v:buildChartData(7)   },
    "30d":  { lbTH:Array.from({length:30},(_,i)=>`${i+1}`), lbEN:Array.from({length:30},(_,i)=>`${i+1}`), v:buildChartData(30) },
    "year": { lbTH:["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],
              lbEN:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], v:buildChartData(365) },
  };

  const gameStatsMap: Record<string, { revenue: number; orders: number }> = {};
  rawOrders.filter(o => o.status==="completed").forEach(o => {
    const name = o.game ?? "Unknown";
    if (!gameStatsMap[name]) gameStatsMap[name] = { revenue:0, orders:0 };
    gameStatsMap[name].revenue += Number(o.amount??0);
    gameStatsMap[name].orders  += 1;
  });
  const topGames = Object.entries(gameStatsMap)
    .sort((a,b) => b[1].revenue - a[1].revenue).slice(0,5)
    .map(([name,stats]) => ({ name, revenue:stats.revenue, stockPct:85, orders:stats.orders }));

  const displayOrders: DisplayOrder[] = rawOrders.slice(0,100).map(o => ({
    id:`ORD-${o.order_id}`, uid:o.uid??"-", game:o.game??"-", pkg:o.pkg??"-",
    method:o.method??"unknown", amount:Number(o.amount??0),
    status:(o.status==="completed"?"success":o.status==="pending"?"pending":o.status==="processing"?"processing":"failed") as TxStatus,
    min:Math.max(0,Math.floor((Date.now()-new Date(o.created_at).getTime())/60000)),
  }));

  const t = T[lang];
  const chart = CHART_PERIODS[period];
  const chartLabels = lang==="th" ? chart.lbTH : chart.lbEN;

  const statCards = [
    { label:t.todaySales,  value:`฿${fmt(Math.round(todayRevenue))}`, chg:"+12.5%", up:true,  icon:Wallet,        accent:"#38bdf8" },
    { label:t.totalOrders, value:String(todayOrders.length),           chg:"+8.3%",  up:true,  icon:ShoppingCart,  accent:"#34d399" },
    { label:t.newMembers,  value:"-",                                   chg:"-",      up:true,  icon:Users,         accent:"#a78bfa" },
    { label:t.successRate, value:`${successRate}%`,                    chg:"+0.5%",  up:true,  icon:Zap,           accent:"#34d399" },
    { label:t.pendingTx,   value:String(pendingOrders.length),         chg:"+2.1%",  up:true,  icon:Clock,         accent:"#f59e0b" },
    { label:t.failedTopup, value:String(failedOrders.length),          chg:"-25%",   up:false, icon:AlertTriangle, accent:"#f87171" },
  ];

  const quickActions = [
    { label:t.qa1, icon:"🔄", color:"#38bdf8", href:null },
    { label:t.qa2, icon:"➕", color:"#34d399", href:"/admin/games" },
    { label:t.qa3, icon:"🏷️", color:"#f59e0b", href:null },
    { label:t.qa4, icon:"👤", color:"#a78bfa", href:null },
    { label:t.qa5, icon:"📊", color:"#38bdf8", href:null },
    { label:t.qa6, icon:"🔁", color:"#f87171", href:null },
  ];

  const periods = [
    { key:"3d"   as const, label:t.period3d },
    { key:"7d"   as const, label:t.period7d },
    { key:"30d"  as const, label:t.period30d },
    { key:"year" as const, label:t.periodY },
  ];

  return (
    <div className="min-h-screen" style={{ fontFamily:"'Noto Sans Thai',sans-serif", background:"#080a16" }}>
      {showAll && <AllOrdersModal onClose={() => setShowAll(false)} t={t} orders={displayOrders} />}

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom:"1px solid #1c2540" }}>
        <div>
          <h1 className="text-lg font-bold text-white">{t.dashboard}</h1>
          <p className="text-[10px]" style={{ color:"#64748b" }}>{t.updatedAt}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Clock */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background:"rgba(11,15,32,0.85)", border:"1px solid #1c2540" }}>
            <Clock size={11} style={{ color:"#38bdf8" }} />
            <span className="font-mono text-xs font-bold" style={{ color:"#e2e8f0", letterSpacing:"0.06em" }}>{now}</span>
          </div>
          {/* Lang */}
          <button onClick={() => setLang(l => l==="th"?"en":"th")}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid #1e293b", color:"#94a3b8" }}>
            {lang==="th"?"EN":"TH"}
          </button>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="p-3 sm:p-5 space-y-4">

        {/* Stat cards — 2 col mobile, 3 col sm, 6 col lg */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="rounded-2xl p-3 sm:p-4 relative overflow-hidden" style={cardBg}>
                <div className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{ background:`radial-gradient(circle at 85% 15%, ${c.accent}18, transparent 65%)` }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[10px] font-semibold leading-tight" style={{ color:"#94a3b8" }}>{c.label}</p>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background:`linear-gradient(135deg,${c.accent}cc,${c.accent}66)` }}>
                      <Icon size={14} color="#fff" />
                    </div>
                  </div>
                  {loading
                    ? <div className="h-6 w-12 rounded-lg animate-pulse mb-1" style={{ background:"#1c2540" }} />
                    : <p className="text-xl font-bold text-white leading-none mb-1">{c.value}</p>}
                  <div className="flex items-center gap-0.5 text-[10px] font-semibold"
                    style={{ color:c.up?"#34d399":"#f87171" }}>
                    {c.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    <span>{c.chg}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main grid — 1 col mobile, 2 col lg */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: Chart + Orders + Top Games */}
          <div className="lg:col-span-2 space-y-4">

            {/* Chart */}
            <div className="rounded-2xl p-4" style={cardBg}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <p className="text-sm font-bold text-white">{t.salesChart}</p>
                <div className="flex gap-1">
                  {periods.map(p => (
                    <button key={p.key} onClick={() => setPeriod(p.key)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                      style={period===p.key
                        ? { background:"rgba(56,189,248,0.18)", color:"#38bdf8", border:"1px solid rgba(56,189,248,0.35)" }
                        : { background:"rgba(255,255,255,0.04)", color:"#64748b", border:"1px solid #1c2540" }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <LineChartSVG values={chart.v} labels={chartLabels} />
            </div>

            {/* Recent Orders */}
            <div className="rounded-2xl overflow-hidden" style={cardBg}>
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom:"1px solid #1c2540" }}>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{t.recentOrders}</p>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background:"rgba(52,211,153,0.12)", color:"#34d399", border:"1px solid rgba(52,211,153,0.3)" }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:"#34d399" }} />Live
                  </span>
                </div>
                <button onClick={() => setShowAll(true)} className="text-xs font-semibold" style={{ color:"#38bdf8" }}>
                  {t.viewAll}
                </button>
              </div>
              {loading ? (
                Array.from({length:4}).map((_,i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom:"1px solid #0d1525" }}>
                    <div className="w-9 h-9 rounded-xl animate-pulse flex-shrink-0" style={{ background:"#1c2540" }} />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 rounded animate-pulse" style={{ background:"#1c2540" }} />
                      <div className="h-2 w-20 rounded animate-pulse" style={{ background:"#1c2540" }} />
                    </div>
                  </div>
                ))
              ) : displayOrders.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color:"#64748b" }}>{t.noOrders}</p>
              ) : displayOrders.slice(0,6).map((o,i) => <OrderRow key={i} o={o} t={t} />)}
            </div>

            {/* Top Games */}
            <div className="rounded-2xl overflow-hidden" style={cardBg}>
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom:"1px solid #1c2540" }}>
                <p className="text-sm font-bold text-white">{t.topGames}</p>
                <button onClick={() => router.push("/admin/games")} className="text-xs font-semibold" style={{ color:"#38bdf8" }}>
                  {t.manageGame}
                </button>
              </div>
              {loading ? (
                <div className="py-8 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : topGames.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color:"#64748b" }}>{t.noGames}</p>
              ) : topGames.map((g,i) => {
                const logo = GAME_LOGOS[g.name];
                const barColor = stockColor(g.stockPct);
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition"
                    style={{ borderBottom:i<topGames.length-1?"1px solid #0d1525":"none" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background:logo?.bg??"#1a1a2a" }}>
                      {logo?.icon??"🎮"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{g.name}</p>
                      <p className="text-[10px]" style={{ color:"#64748b" }}>{fmt(g.orders)} {t.orders}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-white">฿{fmt(g.revenue)}</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.07)" }}>
                          <div className="h-full rounded-full" style={{ width:`${g.stockPct}%`, background:barColor }} />
                        </div>
                        <span className="text-[9px] font-semibold" style={{ color:barColor }}>{g.stockPct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Quick Actions + System Status */}
          <div className="space-y-4">

            {/* Quick Actions — 3 col บน mobile, 2 col บน right panel */}
            <div className="rounded-2xl p-4" style={cardBg}>
              <p className="text-sm font-bold text-white pb-3 mb-3" style={{ borderBottom:"1px solid #1c2540" }}>
                {t.quickActions}
              </p>
              <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                {quickActions.map((a,i) => (
                  <button key={i} onClick={() => a.href && router.push(a.href)}
                    className="rounded-xl p-3 text-left transition-all hover:scale-[1.03] active:scale-[0.97]"
                    style={{ background:`${a.color}12`, border:`1px solid ${a.color}28` }}>
                    <p className="text-lg mb-1">{a.icon}</p>
                    <p className="text-[10px] font-bold leading-tight text-white">{a.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="rounded-2xl p-4" style={cardBg}>
              <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom:"1px solid #1c2540" }}>
                <p className="text-sm font-bold text-white">{t.systemStatus}</p>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background:"rgba(52,211,153,0.12)", color:"#34d399", border:"1px solid rgba(52,211,153,0.35)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  {t.allOnline}
                </span>
              </div>
              <div className="space-y-2">
                {systemServices.map((s,i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{ background:"rgba(255,255,255,0.025)", border:"1px solid #141c30" }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:s.ok?"#34d399":"#f87171" }} />
                    <span className="text-[11px] text-white flex-1 truncate">{s.name}</span>
                    <span className="text-[10px] font-mono font-semibold" style={{ color:s.ok?"#34d399":"#f87171" }}>{s.latency}</span>
                  </div>
                ))}
              </div>
              <p className="text-[9px] mt-2 text-center" style={{ color:"#3a4a6a" }}>
                {t.lastCheckedLabel}: {now}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
