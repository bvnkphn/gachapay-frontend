"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  Ticket, MessageSquare, BookOpen, Search, Send,
  Plus, Trash2, Edit3, X, Check, AlertCircle,
  CheckCircle2, XCircle, RefreshCw, FileImage,
  Link2, ShoppingCart, History, User,
  Eye, Youtube, Tag, CreditCard, Gamepad2, TrendingUp,
} from "lucide-react";

type TicketStatus = "new" | "inprogress" | "resolved" | "closed";
type TicketItem = {
  id: string; ticketNo: string; subject: string;
  status: TicketStatus; priority: string; category: string | null;
  email: string; name: string;
  user: { id: string; name: string; email: string; tier: string } | null;
  assignee: { id: string; name: string } | null;
  messageCount: number; lastMessage: any;
  orderId: string | null; createdAt: string;
};
type TicketMsg = {
  id: string; senderType: "user" | "admin"; message: string;
  imageUrl: string | null; createdAt: string;
  user: { id: string; name: string; role: string } | null;
};
type TicketHistoryItem = {
  id: string; action: string; fromValue: string | null;
  toValue: string | null; note: string | null; createdAt: string;
  admin: { id: string; name: string } | null;
};
type OrderRef = {
  id: string; gameName: string; packageName: string;
  packagePrice: string; finalPrice: string | null; cost?: string | null;
  status: string; paymentMethod: string | null;
  uid: string; createdAt: string;
};
type TicketDetail = TicketItem & {
  messages: TicketMsg[];
  histories: TicketHistoryItem[];
  orderRef: OrderRef | null;
  orderCount: number;
};
type FaqItem = {
  id: number; question: string; answer: string;
  videoUrl: string | null; category: string;
  order: number; viewCount: number; isActive: boolean;
  createdAt: string; updatedAt: string;
};
type FaqDraft = { question: string; answer: string; videoUrl: string; category: string };

const STATUS_CFG: Record<TicketStatus, { label: string; color: string; bg: string; border: string; icon: any }> = {
  new:        { label: "ใหม่",           color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.3)",  icon: AlertCircle  },
  inprogress: { label: "กำลังดำเนินการ", color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  icon: RefreshCw    },
  resolved:   { label: "แก้ไขแล้ว",     color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)",  icon: CheckCircle2 },
  closed:     { label: "ปิดเคส",        color: "#94a3b8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.25)", icon: XCircle      },
};
const PRIORITY_CFG: Record<string, { label: string; color: string }> = {
  low:    { label: "ต่ำ",       color: "#64748b" },
  normal: { label: "ปกติ",     color: "#94a3b8" },
  high:   { label: "สูง",      color: "#f59e0b" },
  urgent: { label: "เร่งด่วน", color: "#f87171" },
};
const FAQ_CATEGORIES = [
  { value: "all",     label: "ทั้งหมด" },
  { value: "topup",   label: "การเติมเงิน" },
  { value: "payment", label: "การชำระเงิน" },
  { value: "refund",  label: "การคืนเงิน" },
  { value: "account", label: "บัญชี" },
  { value: "general", label: "ทั่วไป" },
];
const ALLOWED: Record<TicketStatus, TicketStatus[]> = {
  new:        ["inprogress", "closed"],
  inprogress: ["resolved", "closed"],
  resolved:   ["closed", "inprogress"],
  closed:     [],
};
const cardStyle = { background: "rgba(11,15,32,0.85)", border: "1px solid #1c2540" };

function fmtDate(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)    return "เมื่อกี้";
  if (diff < 3600)  return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function fmtMoney(n: number) { return `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?]+)/, /youtube\.com\/embed\/([^?]+)/];
  for (const p of patterns) { const m = url.match(p); if (m) return `https://www.youtube.com/embed/${m[1]}`; }
  return null;
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const c = STATUS_CFG[status]; const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      <Icon size={11} />{c.label}
    </span>
  );
}

// ── Order Reference Card ──────────────────────────────────────────
function OrderRefCard({ order }: { order: OrderRef }) {
  const finalPrice = Number(order.finalPrice ?? order.packagePrice);
  const cost       = Number(order.cost ?? 0);
  const profit     = finalPrice - cost;

  const txStatusCfg: Record<string, { label: string; color: string; bg: string }> = {
    completed: { label: "SUCCESS",    color: "#34d399", bg: "rgba(52,211,153,0.15)"  },
    pending:   { label: "PENDING",    color: "#fbbf24", bg: "rgba(251,191,36,0.15)"  },
    failed:    { label: "FAILED",     color: "#f87171", bg: "rgba(248,113,113,0.15)" },
    refunded:  { label: "REFUNDED",   color: "#a78bfa", bg: "rgba(167,139,250,0.15)" },
  };
  const txCfg = txStatusCfg[order.status] ?? { label: order.status.toUpperCase(), color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0d1526", border: "1px solid #1c2540" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #1c2540" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(129,140,248,0.12)" }}>
            <ShoppingCart size={16} style={{ color: "#818cf8" }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Order #{order.id}</p>
            <p className="text-[10px]" style={{ color: "#64748b" }}>
              Created on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}
              {" "}{new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Status */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #1c2540" }}>
        <div>
          <p className="text-[10px] tracking-widest font-semibold mb-1.5" style={{ color: "#64748b" }}>TRANSACTION STATUS</p>
          <span className="px-3 py-1 rounded-lg text-xs font-bold"
            style={{ background: txCfg.bg, color: txCfg.color }}>
            {txCfg.label}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] tracking-widest font-semibold mb-1.5" style={{ color: "#64748b" }}>PAYMENT METHOD</p>
          <p className="text-sm font-bold text-white">{order.paymentMethod ?? "—"}</p>
        </div>
      </div>

      {/* Game Details + Financials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">

        {/* Game Details */}
        <div className="px-5 py-4" style={{ borderRight: "1px solid #1c2540" }}>
          <div className="flex items-center gap-2 mb-3">
            <Gamepad2 size={12} style={{ color: "#38bdf8" }} />
            <p className="text-[10px] tracking-widest font-bold" style={{ color: "#38bdf8" }}>GAME DETAILS</p>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Game Name:",       value: order.gameName },
              { label: "Package:",         value: order.packageName },
              { label: "Player ID (UID):", value: order.uid },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-3">
                <span className="text-xs flex-shrink-0" style={{ color: "#64748b" }}>{label}</span>
                <span className="text-sm font-semibold text-white text-right truncate max-w-[55%]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financials */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={12} style={{ color: "#34d399" }} />
            <p className="text-[10px] tracking-widest font-bold" style={{ color: "#34d399" }}>FINANCIALS</p>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "#64748b" }}>Total Amount:</span>
              <span className="text-sm font-bold text-white">{fmtMoney(finalPrice)}</span>
            </div>
            {cost > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "#64748b" }}>Cost Price:</span>
                <span className="text-sm" style={{ color: "#94a3b8" }}>{fmtMoney(cost)}</span>
              </div>
            )}
            {cost > 0 && (
              <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #1c2540" }}>
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={11} style={{ color: "#34d399" }} />
                  <span className="text-xs font-bold" style={{ color: "#34d399" }}>ADMIN PROFIT:</span>
                </div>
                <span className="text-base font-bold" style={{ color: profit >= 0 ? "#34d399" : "#f87171" }}>
                  {fmtMoney(profit)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqForm({ initial, onSave, onCancel, saving }: {
  initial: FaqDraft; onSave: (data: FaqDraft) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState<FaqDraft>(initial);
  const embedUrl = getYoutubeEmbedUrl(form.videoUrl);
  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: "rgba(88,50,210,0.08)", border: "1px solid rgba(129,140,248,0.3)" }}>
      <div>
        <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#94a3b8" }}>หมวดหมู่</label>
        <div className="flex gap-2 flex-wrap">
          {FAQ_CATEGORIES.filter(c => c.value !== "all").map(c => (
            <button key={c.value} type="button" onClick={() => setForm(p => ({ ...p, category: c.value }))}
              className="px-3 py-1 rounded-full text-xs font-semibold transition"
              style={form.category === c.value
                ? { background: "rgba(129,140,248,0.25)", color: "#a5b4fc", border: "1px solid rgba(129,140,248,0.5)" }
                : { color: "#64748b", border: "1px solid #1c2540" }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#94a3b8" }}>คำถาม *</label>
        <input value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
          placeholder="เช่น: วิธีเติมเกมทำอย่างไร?"
          className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1c2540" }} />
      </div>
      <div>
        <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#94a3b8" }}>คำตอบ *</label>
        <textarea value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
          placeholder="อธิบายคำตอบให้ชัดเจน..." rows={4}
          className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1c2540" }} />
      </div>
      <div>
        <label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
          <Youtube size={12} style={{ color: "#f87171" }} /> Video URL (YouTube) — ไม่บังคับ
        </label>
        <input value={form.videoUrl} onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1c2540" }} />
        {embedUrl && (
          <div className="mt-3 rounded-xl overflow-hidden" style={{ border: "1px solid #1c2540" }}>
            <iframe src={embedUrl} width="100%" height="180"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen className="block" />
          </div>
        )}
        {form.videoUrl && !embedUrl && <p className="text-xs mt-1" style={{ color: "#f87171" }}>URL ไม่ถูกต้อง</p>}
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} disabled={saving || !form.question.trim() || !form.answer.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
          style={{ background: "rgba(52,211,153,0.2)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
          {saving ? <RefreshCw size={12} className="animate-spin" /> : <Check size={13} />} บันทึก
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm" style={{ color: "#94a3b8", border: "1px solid #1c2540" }}>
          ยกเลิก
        </button>
      </div>
    </div>
  );
}

type Tab = "tickets" | "faq";
type DetailTab = "chat" | "history" | "order";

export default function SupportDashboard() {
  const { token } = useAdminAuth();
  const [tab, setTab]           = useState<Tab>("tickets");
  const [detailTab, setDetailTab] = useState<DetailTab>("chat");
  const [tickets, setTickets]   = useState<TicketItem[]>([]);
  const [selected, setSelected] = useState<TicketDetail | null>(null);
  const [stats, setStats]       = useState({ total:0, new:0, inprogress:0, resolved:0, closed:0, urgent:0 });
  const [loading, setLoading]   = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusFilter, setStatusFilter]   = useState<TicketStatus | "all">("all");
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [msgInput, setMsgInput]     = useState("");
  const [sending, setSending]       = useState(false);
  const searchTimer = useRef<any>(null);
  const chatEndRef  = useRef<HTMLDivElement>(null);

  const [faqs, setFaqs]               = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading]   = useState(false);
  const [faqSaving, setFaqSaving]     = useState(false);
  const [faqCatFilter, setFaqCatFilter] = useState("all");
  const [showNewFaq, setShowNewFaq]   = useState(false);
  const [editFaqId, setEditFaqId]     = useState<number | null>(null);
  const EMPTY_DRAFT: FaqDraft = { question:"", answer:"", videoUrl:"", category:"general" };

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ page:"1", limit:"50",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(search   && { search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo   && { dateTo }),
      });
      const [tRes, sRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/support/admin/tickets?${p}`, { headers:{ Authorization:`Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/support/admin/stats`,         { headers:{ Authorization:`Bearer ${token}` } }),
      ]);
      setTickets(tRes.data?.data ?? []);
      setStats(sRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, statusFilter, search, dateFrom, dateTo]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const fetchFaqs = useCallback(async () => {
    if (!token) return;
    setFaqLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/faq/admin`, { headers:{ Authorization:`Bearer ${token}` } });
      setFaqs(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
    finally { setFaqLoading(false); }
  }, [token]);

  useEffect(() => { if (tab === "faq") fetchFaqs(); }, [tab, fetchFaqs]);

  const fetchDetail = useCallback(async (id: string) => {
    if (!token) return;
    setLoadingDetail(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/support/admin/tickets/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      setSelected(res.data);
      setDetailTab("chat");
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:"smooth" }), 150);
    } catch (e) { console.error(e); }
    finally { setLoadingDetail(false); }
  }, [token]);

  const handleSearch = (v: string) => {
    setSearchInput(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(v), 400);
  };

  const updateStatus = async (id: string, status: TicketStatus) => {
    if (!token) return;
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/support/admin/tickets/${id}/status`, { status }, { headers:{ Authorization:`Bearer ${token}` } });
      await Promise.all([fetchTickets(), fetchDetail(id)]);
    } catch (e: any) { alert(e?.response?.data?.message ?? "เปลี่ยนสถานะไม่สำเร็จ"); }
  };

  const sendReply = async () => {
    if (!msgInput.trim() || !selected || !token) return;
    setSending(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/support/admin/tickets/${selected.id}/reply`, { message: msgInput }, { headers:{ Authorization:`Bearer ${token}` } });
      setMsgInput("");
      await fetchDetail(selected.id);
    } catch (e: any) { alert(e?.response?.data?.message ?? "ส่งไม่สำเร็จ"); }
    finally { setSending(false); }
  };

  const createFaq = async (data: FaqDraft) => {
    if (!token) return; setFaqSaving(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/faq/admin`, { question:data.question, answer:data.answer, videoUrl:data.videoUrl||null, category:data.category }, { headers:{ Authorization:`Bearer ${token}` } });
      setShowNewFaq(false); await fetchFaqs();
    } catch (e: any) { alert(e?.response?.data?.message ?? "สร้างไม่สำเร็จ"); }
    finally { setFaqSaving(false); }
  };

  const updateFaq = async (id: number, data: FaqDraft) => {
    if (!token) return; setFaqSaving(true);
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/faq/admin/${id}`, { question:data.question, answer:data.answer, videoUrl:data.videoUrl||null, category:data.category }, { headers:{ Authorization:`Bearer ${token}` } });
      setEditFaqId(null); await fetchFaqs();
    } catch (e: any) { alert(e?.response?.data?.message ?? "แก้ไขไม่สำเร็จ"); }
    finally { setFaqSaving(false); }
  };

  const deleteFaq = async (id: number) => {
    if (!token || !confirm("ลบ FAQ นี้?")) return;
    try { await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/faq/admin/${id}`, { headers:{ Authorization:`Bearer ${token}` } }); await fetchFaqs(); }
    catch (e: any) { alert(e?.response?.data?.message ?? "ลบไม่สำเร็จ"); }
  };

  const toggleFaqActive = async (faq: FaqItem) => {
    if (!token) return;
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/faq/admin/${faq.id}`, { isActive: !faq.isActive }, { headers:{ Authorization:`Bearer ${token}` } });
      setFaqs(p => p.map(f => f.id === faq.id ? {...f, isActive:!f.isActive} : f));
    } catch (e) { console.error(e); }
  };

  const filteredFaqs = faqs.filter(f => faqCatFilter === "all" || f.category === faqCatFilter);

  return (
    <div className="min-h-screen p-3 sm:p-5 space-y-4"
      style={{ background:"linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)", fontFamily:"'Noto Sans Thai',sans-serif" }}>

      <div>
        <p className="text-[10px] text-[#3a4a6a] tracking-widest uppercase font-mono mb-1">Super Admin · Support</p>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          จัดการ <span style={{ background:"linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Support & FAQ</span>
        </h1>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {([
          { key:"total",      label:"ทั้งหมด",        color:"#94a3b8" },
          { key:"new",        label:"ใหม่",            color:"#38bdf8" },
          { key:"inprogress", label:"กำลังดำเนินการ", color:"#fbbf24" },
          { key:"resolved",   label:"แก้ไขแล้ว",      color:"#34d399" },
          { key:"closed",     label:"ปิดเคส",          color:"#64748b" },
          { key:"urgent",     label:"เร่งด่วน",        color:"#f87171" },
        ] as const).map(s => (
          <div key={s.key}
            onClick={() => s.key !== "total" && s.key !== "urgent" && setStatusFilter(s.key === statusFilter ? "all" : s.key as TicketStatus)}
            className="rounded-2xl p-3 cursor-pointer transition"
            style={{ ...cardStyle, border: statusFilter===s.key ? `1px solid ${s.color}` : "1px solid #1c2540" }}>
            <p className="text-[9px] mb-1" style={{ color:"#64748b" }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color:s.color }}>{stats[s.key]}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {([["tickets",Ticket,"Ticket Management"],["faq",BookOpen,"FAQ & คู่มือ"]] as const).map(([key,Icon,label]) => (
          <button key={key} onClick={() => setTab(key as Tab)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition"
            style={tab===key
              ? { background:"rgba(88,50,210,0.28)", color:"#a5b4fc", border:"1px solid rgba(129,140,248,0.4)" }
              : { ...cardStyle, color:"#64748b" }}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>

      {tab === "tickets" && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-2 space-y-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #1c2540" }}>
              <Search size={13} style={{ color:"#64748b" }} />
              <input value={searchInput} onChange={e => handleSearch(e.target.value)}
                placeholder="ค้นหา ticket, email, order id..."
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-[#3a4a6a]" />
              {searchInput && <button onClick={() => { setSearchInput(""); setSearch(""); }}><X size={12} style={{ color:"#64748b" }}/></button>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] mb-1 block" style={{ color:"#64748b" }}>ตั้งแต่วันที่</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="w-full rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #1c2540" }} />
              </div>
              <div>
                <label className="text-[10px] mb-1 block" style={{ color:"#64748b" }}>ถึงวันที่</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="w-full rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #1c2540" }} />
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {(["all","new","inprogress","resolved","closed"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition"
                  style={statusFilter===s
                    ? s==="all"
                      ? { background:"rgba(99,102,241,0.25)", color:"#a5b4fc", border:"1px solid rgba(129,140,248,0.4)" }
                      : { background:STATUS_CFG[s].bg, color:STATUS_CFG[s].color, border:`1px solid ${STATUS_CFG[s].border}` }
                    : { color:"#64748b", border:"1px solid #1c2540" }}>
                  {s==="all" ? "ทั้งหมด" : STATUS_CFG[s].label}
                </button>
              ))}
            </div>
            {loading ? Array.from({length:5}).map((_,i) => (
              <div key={i} className="rounded-2xl p-4 animate-pulse" style={cardStyle}>
                <div className="h-3 w-20 rounded mb-2" style={{ background:"#1c2540" }} />
                <div className="h-4 w-48 rounded mb-1" style={{ background:"#1c2540" }} />
              </div>
            )) : tickets.length === 0 ? (
              <div className="text-center py-12 text-sm" style={{ color:"#64748b" }}>ไม่พบ ticket</div>
            ) : tickets.map(t => (
              <button key={t.id} onClick={() => fetchDetail(t.id)}
                className="w-full text-left rounded-2xl p-4 transition-all"
                style={selected?.id===t.id
                  ? { background:"rgba(88,50,210,0.18)", border:"1px solid rgba(129,140,248,0.4)" }
                  : cardStyle}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color:"#67e8f9" }}>{t.ticketNo}</span>
                    {t.priority === "urgent" && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background:"rgba(248,113,113,0.15)", color:"#f87171" }}>เร่งด่วน</span>}
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-sm font-semibold text-white leading-snug mb-1">{t.subject}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs truncate max-w-[120px]" style={{ color:"#94a3b8" }}>{t.name}</span>
                    {t.orderId && <span className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                      style={{ background:"rgba(129,140,248,0.12)", color:"#818cf8" }}>#{t.orderId.slice(-6)}</span>}
                  </div>
                  <span className="text-[10px] flex-shrink-0" style={{ color:"#64748b" }}>{fmtDate(t.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="xl:col-span-3 space-y-4">
            {!selected ? (
              <div className="rounded-2xl flex items-center justify-center" style={{ ...cardStyle, height:400 }}>
                <div className="text-center space-y-2">
                  <MessageSquare size={32} className="mx-auto" style={{ color:"#1c2540" }} />
                  <p className="text-sm" style={{ color:"#64748b" }}>เลือก ticket เพื่อดูรายละเอียด</p>
                </div>
              </div>
            ) : loadingDetail ? (
              <div className="rounded-2xl flex items-center justify-center" style={{ ...cardStyle, height:400 }}>
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="rounded-2xl p-4" style={cardStyle}>
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono" style={{ color:"#67e8f9" }}>{selected.ticketNo}</span>
                        <StatusBadge status={selected.status} />
                        {selected.priority !== "normal" && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background:"rgba(245,158,11,0.12)", color:PRIORITY_CFG[selected.priority]?.color??"#94a3b8" }}>
                            {PRIORITY_CFG[selected.priority]?.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-white">{selected.subject}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs" style={{ color:"#64748b" }}>
                          <User size={10} className="inline mr-1"/>{selected.name} · {selected.email}
                        </span>
                        {selected.orderCount > 0 && <span className="text-xs" style={{ color:"#64748b" }}>
                          <ShoppingCart size={10} className="inline mr-1"/>{selected.orderCount} คำสั่งซื้อ
                        </span>}
                        {selected.assignee && <span className="text-xs" style={{ color:"#818cf8" }}>ผู้รับผิดชอบ: {selected.assignee.name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {(ALLOWED[selected.status]??[]).map(s => (
                      <button key={s} onClick={() => updateStatus(selected.id, s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
                        style={{ background:STATUS_CFG[s].bg, color:STATUS_CFG[s].color, border:`1px solid ${STATUS_CFG[s].border}` }}>
                        → {STATUS_CFG[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {([["chat",MessageSquare,"การสนทนา"],["order",ShoppingCart,"ข้อมูลออเดอร์"],["history",History,"ประวัติ"]] as const).map(([key,Icon,label]) => (
                    <button key={key} onClick={() => setDetailTab(key as DetailTab)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                      style={detailTab===key
                        ? { background:"rgba(56,189,248,0.15)", color:"#38bdf8", border:"1px solid rgba(56,189,248,0.3)" }
                        : { ...cardStyle, color:"#64748b" }}>
                      <Icon size={12}/>{label}
                    </button>
                  ))}
                </div>

                {detailTab === "chat" && (
                  <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                    <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom:"1px solid #1c2540" }}>
                      <MessageSquare size={13} style={{ color:"#818cf8" }} />
                      <span className="text-sm font-semibold text-white">การสนทนา</span>
                      <span className="text-xs ml-auto" style={{ color:"#64748b" }}>{selected.messages.length} ข้อความ</span>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight:320 }}>
                      {selected.messages.length === 0 ? (
                        <p className="text-center text-sm py-8" style={{ color:"#64748b" }}>ยังไม่มีข้อความ</p>
                      ) : selected.messages.map((m, i) => (
                        <div key={i} className={`flex ${m.senderType==="admin"?"justify-end":"justify-start"}`}>
                          <div style={{ maxWidth:"75%" }}>
                            <p className="text-[10px] mb-1 px-1" style={{ color:"#64748b" }}>
                              {m.user?.name??selected.name} · {fmtDate(m.createdAt)}
                            </p>
                            <div className="rounded-2xl px-4 py-2.5 text-sm"
                              style={m.senderType==="admin"
                                ? { background:"rgba(99,102,241,0.25)", color:"#e0e7ff", borderBottomRightRadius:4 }
                                : { background:"rgba(255,255,255,0.06)", color:"#cbd5e1", borderBottomLeftRadius:4 }}>
                              {m.imageUrl ? <div className="flex items-center gap-2 text-xs" style={{ color:"#94a3b8" }}><FileImage size={13}/>ไฟล์แนบ</div> : m.message}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-3" style={{ borderTop:"1px solid #1c2540" }}>
                      <div className="flex gap-2">
                        <input value={msgInput} onChange={e => setMsgInput(e.target.value)}
                          onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendReply()}
                          placeholder="พิมพ์ข้อความตอบกลับ... (Enter ส่ง)"
                          className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #1c2540" }} />
                        <button onClick={sendReply} disabled={sending || !msgInput.trim()}
                          className="px-4 py-2.5 rounded-xl font-semibold disabled:opacity-50"
                          style={{ background:"linear-gradient(135deg,#38bdf8,#818cf8)", color:"white" }}>
                          {sending ? <RefreshCw size={15} className="animate-spin"/> : <Send size={15}/>}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Order tab — ใช้ OrderRefCard แทน */}
                {detailTab === "order" && (
                  <div>
                    {!selected.orderRef ? (
                      <div className="rounded-2xl flex items-center justify-center py-16" style={cardStyle}>
                        <div className="text-center space-y-2">
                          <ShoppingCart size={28} className="mx-auto" style={{ color:"#1c2540" }} />
                          <p className="text-sm" style={{ color:"#64748b" }}>ไม่มีออเดอร์ที่เกี่ยวข้องกับ ticket นี้</p>
                        </div>
                      </div>
                    ) : (
                      <OrderRefCard order={selected.orderRef} />
                    )}
                  </div>
                )}

                {detailTab === "history" && (
                  <div className="rounded-2xl p-4" style={cardStyle}>
                    <div className="flex items-center gap-2 pb-3 mb-4" style={{ borderBottom:"1px solid #1c2540" }}>
                      <History size={14} style={{ color:"#f472b6" }} />
                      <p className="text-sm font-bold text-white">ประวัติการดำเนินการ</p>
                    </div>
                    {selected.histories.length === 0 ? (
                      <p className="text-center py-8 text-sm" style={{ color:"#64748b" }}>ยังไม่มีประวัติ</p>
                    ) : (
                      <div className="space-y-3">
                        {selected.histories.map(h => (
                          <div key={h.id} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background:"#818cf8" }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-white">
                                  {h.action==="status_changed" ? `เปลี่ยนสถานะ ${h.fromValue} → ${h.toValue}`
                                    : h.action==="assigned" ? "มอบหมายให้ Admin"
                                    : h.action==="replied" ? "ตอบกลับ" : h.action}
                                </span>
                                {h.admin && <span className="text-[10px]" style={{ color:"#64748b" }}>โดย {h.admin.name}</span>}
                              </div>
                              {h.note && <p className="text-xs mt-0.5 truncate" style={{ color:"#64748b" }}>{h.note}</p>}
                              <p className="text-[10px] mt-0.5" style={{ color:"#3a4a6a" }}>{fmtDate(h.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {tab === "faq" && (
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 overflow-x-auto">
                {FAQ_CATEGORIES.map(c => (
                  <button key={c.value} onClick={() => setFaqCatFilter(c.value)}
                    className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition"
                    style={faqCatFilter===c.value
                      ? { background:"rgba(129,140,248,0.25)", color:"#a5b4fc", border:"1px solid rgba(129,140,248,0.5)" }
                      : { color:"#64748b", border:"1px solid #1c2540" }}>
                    {c.label}
                  </button>
                ))}
              </div>
              <span className="text-xs" style={{ color:"#3a4a6a" }}>{filteredFaqs.length} รายการ</span>
            </div>
            <button onClick={() => { setShowNewFaq(true); setEditFaqId(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background:"rgba(56,189,248,0.12)", border:"1px solid rgba(56,189,248,0.28)", color:"#38bdf8" }}>
              <Plus size={14}/> เพิ่มคำถาม
            </button>
          </div>

          {showNewFaq && <FaqForm initial={EMPTY_DRAFT} onSave={createFaq} onCancel={() => setShowNewFaq(false)} saving={faqSaving} />}

          {faqLoading ? (
            <div className="space-y-3">{Array.from({length:3}).map((_,i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse" style={cardStyle}>
                <div className="h-4 w-64 rounded mb-3" style={{ background:"#1c2540" }} />
                <div className="h-3 w-full rounded mb-2" style={{ background:"#1c2540" }} />
              </div>
            ))}</div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-16" style={{ color:"#64748b" }}>
              <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">ยังไม่มี FAQ ในหมวดนี้</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => {
                const embedUrl = getYoutubeEmbedUrl(faq.videoUrl ?? "");
                const isEditing = editFaqId === faq.id;
                const catLabel = FAQ_CATEGORIES.find(c => c.value===faq.category)?.label ?? faq.category;
                return (
                  <div key={faq.id} className="rounded-2xl overflow-hidden transition"
                    style={{ ...cardStyle, opacity: faq.isActive ? 1 : 0.5 }}>
                    {isEditing ? (
                      <div className="p-4">
                        <FaqForm
                          initial={{ question:faq.question, answer:faq.answer, videoUrl:faq.videoUrl??"", category:faq.category }}
                          onSave={(data) => updateFaq(faq.id, data)}
                          onCancel={() => setEditFaqId(null)}
                          saving={faqSaving}
                        />
                      </div>
                    ) : (
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="text-xs font-mono mt-0.5 shrink-0 w-8 text-center py-0.5 rounded-lg"
                              style={{ background:"rgba(129,140,248,0.12)", color:"#818cf8" }}>Q{idx+1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <p className="text-sm font-semibold text-white">{faq.question}</p>
                                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                                  style={{ background:"rgba(129,140,248,0.1)", color:"#818cf8", border:"1px solid rgba(129,140,248,0.2)" }}>
                                  <Tag size={9}/>{catLabel}
                                </span>
                                <span className="flex items-center gap-1 text-[10px]" style={{ color:"#64748b" }}>
                                  <Eye size={9}/>{faq.viewCount} views
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed" style={{ color:"#94a3b8" }}>{faq.answer}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => toggleFaqActive(faq)}
                              style={{
                                position:"relative", width:44, height:24, borderRadius:12,
                                background: faq.isActive ? "#34d399" : "#334155",
                                border:"none", cursor:"pointer", flexShrink:0, transition:"background 0.2s",
                              }}>
                              <span style={{
                                position:"absolute", top:2, left: faq.isActive ? 22 : 2,
                                width:20, height:20, borderRadius:"50%", background:"white",
                                boxShadow:"0 1px 3px rgba(0,0,0,0.3)", transition:"left 0.2s", display:"block",
                              }} />
                            </button>
                            <button onClick={() => { setEditFaqId(faq.id); setShowNewFaq(false); }}
                              className="p-2 rounded-lg hover:bg-white/10" style={{ color:"#94a3b8" }}>
                              <Edit3 size={13}/>
                            </button>
                            <button onClick={() => deleteFaq(faq.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10" style={{ color:"#f87171" }}>
                              <Trash2 size={13}/>
                            </button>
                          </div>
                        </div>
                        {faq.videoUrl && embedUrl && (
                          <div className="mt-3 rounded-xl overflow-hidden" style={{ border:"1px solid #1c2540" }}>
                            <div className="flex items-center gap-2 px-3 py-2" style={{ background:"rgba(248,113,113,0.08)", borderBottom:"1px solid #1c2540" }}>
                              <Youtube size={12} style={{ color:"#f87171" }} />
                              <span className="text-[10px] font-semibold" style={{ color:"#f87171" }}>VIDEO GUIDE</span>
                              <a href={faq.videoUrl} target="_blank" rel="noreferrer" className="ml-auto text-[10px] flex items-center gap-1" style={{ color:"#64748b" }}>
                                <Link2 size={9}/> เปิดใน YouTube
                              </a>
                            </div>
                            <iframe src={embedUrl} width="100%" height="200"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen className="block" />
                          </div>
                        )}
                        {faq.videoUrl && !embedUrl && (
                          <a href={faq.videoUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-xs" style={{ color:"#38bdf8" }}>
                            <Link2 size={11}/> ดูวิดีโอ
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
