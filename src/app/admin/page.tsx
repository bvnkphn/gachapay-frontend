"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight, ArrowDownRight, Wallet, ShoppingCart,
  Users, Clock, AlertTriangle, Zap, X, Sun, Moon
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
  success:    { color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" },
  processing: { color: "#06b6d4", bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.25)"  },
  pending:    { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)"  },
  failed:     { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)"   },
};

function stockColor(p: number) { return p >= 80 ? "#10b981" : p >= 50 ? "#f59e0b" : "#ef4444"; }
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
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        {[.25,.5,.75].map(r => (
          <line key={r} x1={pX} y1={pY+r*(H-pY*2)} x2={W-pX} y2={pY+r*(H-pY*2)}
            stroke="currentColor" className="text-border/40" strokeWidth={1} strokeDasharray="3,4" />
        ))}
        <path d={area} fill="url(#cg)" />
        <path d={path} fill="none" stroke="#06b6d4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={peak.x} cy={peak.y} r={4} fill="#06b6d4" stroke="currentColor" className="text-card" strokeWidth={2} />
      </svg>
      <div className="flex justify-between px-1 mt-1">
        {sl.map((l, i) => <span key={i} className="text-[9px] text-muted-foreground/60">{l}</span>)}
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
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition cursor-pointer border-b border-border/50">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: logo?.bg ?? "#1c1c2a" }}>
        {logo?.icon ?? "🎮"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-foreground truncate">{o.game}</span>
          <span className="text-[10px] text-muted-foreground truncate">· {o.pkg}</span>
        </div>
        <p className="text-[10px] mt-0.5 text-muted-foreground truncate">
          {o.uid} · {o.min}{t.minAgo}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <p className="text-xs font-bold text-foreground">฿{fmt(o.amount)}</p>
        <StatusBadge status={o.status} t={t} />
      </div>
    </div>
  );
}

function AllOrdersModal({ onClose, t, orders }: { onClose: () => void; t: typeof T["th"]; orders: DisplayOrder[] }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl overflow-hidden bg-card text-card-foreground border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-border/80">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-foreground">{t.allOrders}</p>
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" />Live
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {orders.length === 0
            ? <p className="text-center py-12 text-sm text-muted-foreground">{t.noOrders}</p>
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
  const [lang] = useState<"th" | "en">("th");
  const [period, setPeriod]   = useState<"3d" | "7d" | "30d" | "year">("7d");
  const [showAll, setShowAll] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const currentTheme = mounted ? (resolvedTheme ?? "dark") : "dark";

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
    { label:t.totalOrders, value:String(todayOrders.length),           chg:"+8.3%",  up:true,  icon:ShoppingCart,  accent:"#10b981" },
    { label:t.newMembers,  value:"-",                                   chg:"-",      up:true,  icon:Users,         accent:"#8b5cf6" },
    { label:t.successRate, value:`${successRate}%`,                    chg:"+0.5%",  up:true,  icon:Zap,           accent:"#10b981" },
    { label:t.pendingTx,   value:String(pendingOrders.length),         chg:"+2.1%",  up:true,  icon:Clock,         accent:"#f59e0b" },
    { label:t.failedTopup, value:String(failedOrders.length),          chg:"-25%",   up:false, icon:AlertTriangle, accent:"#ef4444" },
  ];

  const quickActions = [
    { label:t.qa1, icon:"🔄", color:"#38bdf8", href:null },
    { label:t.qa2, icon:"➕", color:"#10b981", href:"/admin/games" },
    { label:t.qa3, icon:"🏷️", color:"#f59e0b", href:null },
    { label:t.qa4, icon:"👤", color:"#8b5cf6", href:null },
    { label:t.qa5, icon:"📊", color:"#06b6d4", href:null },
    { label:t.qa6, icon:"🔁", color:"#ef4444", href:null },
  ];

  const periods = [
    { key:"3d"   as const, label:t.period3d },
    { key:"7d"   as const, label:t.period7d },
    { key:"30d"  as const, label:t.period30d },
    { key:"year" as const, label:t.periodY },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily:"'Noto Sans Thai',sans-serif" }}>
      {showAll && <AllOrdersModal onClose={() => setShowAll(false)} t={t} orders={displayOrders} />}

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-card">
        <div>
          <h1 className="text-lg font-bold text-foreground">{t.dashboard}</h1>
          <p className="text-[10px] text-muted-foreground">{t.updatedAt}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Clock */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-foreground">
            <Clock size={11} className="text-primary" />
            <span className="font-mono text-xs font-bold tracking-wider">{now}</span>
          </div>

          {/* Theme Toggler Capsule Switch */}
          <div
            className="relative flex items-center w-[64px] h-8 bg-muted border border-border/80 rounded-full p-1 cursor-pointer select-none transition-colors duration-300"
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            title={currentTheme === "dark" ? "เปิดโหมดสว่าง" : "เปิดโหมดมืด"}
          >
            {/* Sliding active pill indicator */}
            <div
              className={cn(
                "absolute top-0.5 left-0.5 w-6.5 h-6.5 rounded-full bg-card shadow-sm transition-transform duration-300 ease-out border border-border/30",
                currentTheme === "dark" ? "translate-x-8" : "translate-x-0"
              )}
            />
            {/* Sun Icon */}
            <div className="relative z-10 flex-1 flex items-center justify-center h-full">
              <Sun className={cn("w-3.5 h-3.5 transition-colors duration-300", currentTheme === "light" ? "text-primary font-bold" : "text-muted-foreground")} />
            </div>
            {/* Moon Icon */}
            <div className="relative z-10 flex-1 flex items-center justify-center h-full">
              <Moon className={cn("w-3.5 h-3.5 transition-colors duration-300", currentTheme === "dark" ? "text-primary font-bold" : "text-muted-foreground")} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="p-3 sm:p-5 space-y-4">

        {/* Stat cards — 2 col mobile, 3 col sm, 6 col lg */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="bg-card text-card-foreground border border-border/80 rounded-2xl p-3 sm:p-4 relative overflow-hidden shadow-sm hover:shadow transition-all duration-300">
                <div className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{ background:`radial-gradient(circle at 85% 15%, ${c.accent}18, transparent 65%)` }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[10px] font-semibold leading-tight text-muted-foreground">{c.label}</p>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background:`linear-gradient(135deg,${c.accent}cc,${c.accent}66)` }}>
                      <Icon size={14} color="#fff" />
                    </div>
                  </div>
                  {loading
                    ? <div className="h-6 w-12 rounded-lg animate-pulse mb-1 bg-muted/85" />
                    : <p className="text-xl font-bold text-foreground leading-none mb-1">{c.value}</p>}
                  <div className="flex items-center gap-0.5 text-[10px] font-semibold"
                    style={{ color:c.up?"#10b981":"#ef4444" }}>
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
            <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow transition-all duration-300">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <p className="text-sm font-bold text-foreground">{t.salesChart}</p>
                <div className="flex gap-1">
                  {periods.map(p => (
                    <button key={p.key} onClick={() => setPeriod(p.key)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border",
                        period === p.key
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-muted/40 text-muted-foreground border-border/80 hover:bg-muted/60"
                      )}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <LineChartSVG values={chart.v} labels={chartLabels} />
            </div>

            {/* Recent Orders */}
            <div className="bg-card text-card-foreground border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all duration-300">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{t.recentOrders}</p>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" />Live
                  </span>
                </div>
                <button onClick={() => setShowAll(true)} className="text-xs font-semibold text-primary hover:underline">
                  {t.viewAll}
                </button>
              </div>
              {loading ? (
                Array.from({length:4}).map((_,i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
                    <div className="w-9 h-9 rounded-xl animate-pulse flex-shrink-0 bg-muted/85" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 rounded animate-pulse bg-muted/85" />
                      <div className="h-2 w-20 rounded animate-pulse bg-muted/85" />
                    </div>
                  </div>
                ))
              ) : displayOrders.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">{t.noOrders}</p>
              ) : displayOrders.slice(0,6).map((o,i) => <OrderRow key={i} o={o} t={t} />)}
            </div>

            {/* Top Games */}
            <div className="bg-card text-card-foreground border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all duration-300">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/80">
                <p className="text-sm font-bold text-foreground">{t.topGames}</p>
                <button onClick={() => router.push("/admin/games")} className="text-xs font-semibold text-primary hover:underline">
                  {t.manageGame}
                </button>
              </div>
              {loading ? (
                <div className="py-8 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : topGames.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">{t.noGames}</p>
              ) : topGames.map((g,i) => {
                const logo = GAME_LOGOS[g.name];
                const barColor = stockColor(g.stockPct);
                return (
                  <div key={i} className={cn(
                    "flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition",
                    i < topGames.length - 1 ? "border-b border-border/60" : ""
                  )}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background:logo?.bg??"#1a1a2a" }}>
                      {logo?.icon??"🎮"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{g.name}</p>
                      <p className="text-[10px] text-muted-foreground">{fmt(g.orders)} {t.orders}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-foreground">฿{fmt(g.revenue)}</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <div className="w-16 h-1 rounded-full overflow-hidden bg-muted">
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

            {/* Quick Actions */}
            <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow transition-all duration-300">
              <p className="text-sm font-bold text-foreground pb-3 mb-3 border-b border-border/80">
                {t.quickActions}
              </p>
              <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                {quickActions.map((a,i) => (
                  <button key={i} onClick={() => a.href && router.push(a.href)}
                    className="rounded-xl p-3 text-left transition-all hover:scale-[1.03] active:scale-[0.97] bg-muted/40 hover:bg-muted/80 border border-border/60 w-full"
                    style={{ borderColor:`${a.color}30` }}>
                    <p className="text-lg mb-1">{a.icon}</p>
                    <p className="text-[10px] font-bold leading-tight text-foreground">{a.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-4 shadow-sm hover:shadow transition-all duration-300">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/80">
                <p className="text-sm font-bold text-foreground">{t.systemStatus}</p>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {t.allOnline}
                </span>
              </div>
              <div className="space-y-2">
                {systemServices.map((s,i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2 bg-muted/20 border border-border/80">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:s.ok?"#10b981":"#ef4444" }} />
                    <span className="text-[11px] text-foreground flex-1 truncate">{s.name}</span>
                    <span className="text-[10px] font-mono font-semibold" style={{ color:s.ok?"#10b981":"#ef4444" }}>{s.latency}</span>
                  </div>
                ))}
              </div>
              <p className="text-[9px] mt-2 text-center text-muted-foreground/60">
                {t.lastCheckedLabel}: {now}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
