"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLanguage } from "@/components/language-context";
import {
  Monitor, Smartphone, Tablet, Activity,
  Save, Check, RefreshCw, Languages,
  Shield, Clock,
} from "lucide-react";

const cardStyle = { background: "rgba(11,15,32,0.85)", border: "1px solid #1c2540" };

const BREAKPOINTS = [
  { id: "mobile",  label: "Mobile",  icon: Smartphone, px: "< 768px",    ok: true },
  { id: "tablet",  label: "Tablet",  icon: Tablet,     px: "768–1024px", ok: true },
  { id: "desktop", label: "Desktop", icon: Monitor,    px: "> 1024px",   ok: true },
];

const LANGUAGES = [
  { code: "th" as const, label: "ภาษาไทย", flag: "🇹🇭" },
  { code: "en" as const, label: "English",  flag: "🇬🇧" },
];

function Toggle({ on, onChange, color = "#34d399", disabled = false }: {
  on: boolean; onChange: () => void; color?: string; disabled?: boolean;
}) {
  return (
    <button onClick={onChange} disabled={disabled}
      style={{
        position: "relative", width: 44, height: 24, borderRadius: 12,
        background: on ? color : "#334155", border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0, transition: "background 0.2s",
      }}>
      <span style={{
        position: "absolute", top: 2, left: on ? 22 : 2,
        width: 20, height: 20, borderRadius: "50%", background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)", transition: "left 0.2s", display: "block",
      }} />
    </button>
  );
}

function StatusDot({ on }: { on: boolean }) {
  return (
    <span className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
      {on && <span className="absolute w-full h-full rounded-full animate-ping opacity-40" style={{ background: "#34d399" }} />}
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: on ? "#34d399" : "#f87171" }} />
    </span>
  );
}

export default function SystemControl() {
  const { token } = useAdminAuth();

  // ✅ เชื่อม Language Context จริง
  const { lang, setLang } = useLanguage();

  const [maintenance, setMaintenance] = useState(false);
  const [maintMsg, setMaintMsg]       = useState("ระบบกำลังปิดปรับปรุงชั่วคราว จะกลับมาให้บริการในเร็วๆ นี้ครับ 🙏");
  const [maintETA, setMaintETA]       = useState("30");
  const [multiLang, setMultiLang]     = useState(true);
  const [notify, setNotify] = useState({
    newOrder: true, failedTransaction: true, lowApiBalance: true, dailyReport: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  // ── Clock ─────────────────────────────────────────────────────
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

  // ── โหลดสถานะจาก API ─────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/system/status`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const d = res.data;
      setMaintenance(d.maintenance?.enabled ?? false);
      setMaintMsg(d.maintenance?.message ?? maintMsg);
      setMaintETA(String(d.maintenance?.etaMinutes ?? 30));
      setNotify({
        newOrder:          d.notifications?.newOrder          ?? true,
        failedTransaction: d.notifications?.failedTransaction ?? true,
        lowApiBalance:     d.notifications?.lowApiBalance     ?? true,
        dailyReport:       d.notifications?.dailyReport       ?? false,
      });
    } catch { setError("โหลดข้อมูลไม่สำเร็จ"); }
    finally  { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // ── บันทึก ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!token) return;
    setSaving(true); setError("");
    try {
      await Promise.all([
        axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/system/maintenance`,
          { enabled: maintenance, message: maintMsg, etaMinutes: Number(maintETA) },
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/system/notifications`,
          notify,
          { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setError("บันทึกไม่สำเร็จ กรุณาลองใหม่"); }
    finally  { setSaving(false); }
  };

  // ── Toggle maintenance → save ทันที ──────────────────────────
  const toggleMaintenance = async () => {
    if (!token) return;
    const next = !maintenance;
    setMaintenance(next);
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/system/maintenance`,
        { enabled: next, message: maintMsg, etaMinutes: Number(maintETA) },
        { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      setMaintenance(!next);
      setError("เปลี่ยนสถานะไม่สำเร็จ");
    }
  };

  // ✅ เปลี่ยนภาษา — เรียก setLang จาก context ทันที ไม่ต้องกด save
  const handleLangChange = (code: "th" | "en") => {
    setLang(code);
  };

  return (
    <div className="min-h-screen pb-6 px-3 sm:px-5 pt-5"
      style={{ background: "linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)", fontFamily: "'Noto Sans Thai',sans-serif" }}>
      <div className="relative max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] tracking-widest uppercase font-mono mb-1" style={{ color: "#3a4a6a" }}>
              Super Admin · System
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              System{" "}
              <span style={{ background: "linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Control Panel
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl self-start mt-1"
            style={{ background: "rgba(11,15,32,0.85)", border: "1px solid #1c2540" }}>
            <Clock size={13} style={{ color: "#38bdf8" }} />
            <span className="font-mono text-sm font-bold" style={{ color: "#e2e8f0", letterSpacing: "0.08em" }}>{now}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Row 1: Maintenance + Notifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Maintenance Mode */}
              <div className="rounded-2xl p-4 sm:p-5"
                style={maintenance
                  ? { background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.35)" }
                  : cardStyle}>
                <div className="flex items-center justify-between pb-3 mb-4 gap-3"
                  style={{ borderBottom: "1px solid #1c2540" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: maintenance ? "rgba(248,113,113,0.2)" : "rgba(129,140,248,0.1)" }}>
                      <Shield size={16} style={{ color: maintenance ? "#f87171" : "#818cf8" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Maintenance Mode</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>ปิดปรับปรุงระบบชั่วคราว</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    {maintenance && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold animate-pulse"
                        style={{ background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.4)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />ON
                      </span>
                    )}
                    <Toggle on={maintenance} onChange={toggleMaintenance} color="#f87171" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#94a3b8" }}>ข้อความแจ้งเตือนผู้ใช้</label>
                    <textarea value={maintMsg} onChange={e => setMaintMsg(e.target.value)}
                      rows={3} disabled={!maintenance}
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none resize-none"
                      style={{
                        background: maintenance ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                        border: maintenance ? "1px solid rgba(248,113,113,0.3)" : "1px solid #1c2540",
                        color: maintenance ? "white" : "#3a4a6a",
                      }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#94a3b8" }}>เวลาโดยประมาณ (นาที)</label>
                    <div className="flex gap-2">
                      {["15", "30", "60", "120"].map(t => (
                        <button key={t} onClick={() => setMaintETA(t)} disabled={!maintenance}
                          className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                          style={maintETA === t && maintenance
                            ? { background: "rgba(248,113,113,0.2)", color: "#f87171", border: "1px solid rgba(248,113,113,0.4)" }
                            : { background: "rgba(255,255,255,0.03)", color: "#64748b", border: "1px solid #1c2540" }}>
                          {t}m
                        </button>
                      ))}
                    </div>
                  </div>
                  {maintenance && (
                    <div className="rounded-xl p-3 text-center"
                      style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)" }}>
                      <Shield size={16} className="mx-auto mb-1" style={{ color: "#f87171" }} />
                      <p className="text-xs font-bold text-white mb-1">ปิดปรับปรุงระบบ</p>
                      <p className="text-[10px] leading-relaxed" style={{ color: "#94a3b8" }}>
                        {maintMsg.slice(0, 80)}{maintMsg.length > 80 ? "..." : ""}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: "#f87171" }}>~{maintETA} นาที</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notification Settings */}
              <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
                <div className="flex items-center gap-2 pb-3 mb-4" style={{ borderBottom: "1px solid #1c2540" }}>
                  <Activity size={14} style={{ color: "#38bdf8", flexShrink: 0 }} />
                  <p className="text-sm font-bold text-white">Notification Settings</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto font-semibold"
                    style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.2)" }}>
                    ส่งผ่าน Email
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { key: "newOrder",          label: "New order alerts",         sub: "แจ้งเตือนเมื่อมีออเดอร์ใหม่"    },
                    { key: "failedTransaction", label: "Failed transaction alerts", sub: "แจ้งเตือนเมื่อการชำระล้มเหลว"  },
                    { key: "lowApiBalance",     label: "Low API balance alerts",   sub: "แจ้งเตือนเมื่อเครดิต API ต่ำ"  },
                    { key: "dailyReport",       label: "Daily report email",       sub: "รายงานสรุปประจำวัน"             },
                  ].map(n => (
                    <div key={n.key} className="flex items-center justify-between rounded-xl px-3 py-3 gap-3"
                      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid #141c30" }}>
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate">{n.label}</p>
                        <p className="text-[10px]" style={{ color: "#64748b" }}>{n.sub}</p>
                      </div>
                      <Toggle
                        on={notify[n.key as keyof typeof notify]}
                        onChange={() => setNotify(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof notify] }))}
                        color="#38bdf8"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Language + Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* ✅ Language Settings — เชื่อม context จริง */}
              <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
                <div className="flex items-center gap-2 pb-3 mb-4" style={{ borderBottom: "1px solid #1c2540" }}>
                  <Languages size={14} style={{ color: "#fbbf24", flexShrink: 0 }} />
                  <p className="text-sm font-bold text-white">Language Settings</p>
                  {/* แสดงภาษาที่ใช้งานอยู่จริง */}
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
                    ใช้งานอยู่: {lang === "th" ? "ภาษาไทย" : "English"}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4 rounded-xl px-3 py-3 gap-3"
                  style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">Multi-language Support</p>
                    <p className="text-xs" style={{ color: "#64748b" }}>เปิดใช้งานระบบหลายภาษา (TH / EN)</p>
                  </div>
                  <Toggle on={multiLang} onChange={() => {
                    const next = !multiLang;
                    setMultiLang(next);
                    // ถ้าปิด multi-lang → reset กลับ TH
                    if (!next) setLang("th");
                  }} color="#fbbf24" />
                </div>

                <p className="text-xs font-semibold mb-2" style={{ color: "#64748b" }}>
                  ภาษาเริ่มต้น{" "}
                  <span style={{ color: "#3a4a6a" }}>— เปลี่ยนทันที ไม่ต้องกดบันทึก</span>
                </p>
                <div className="flex gap-2">
                  {LANGUAGES.map(l => (
                    <button key={l.code}
                      onClick={() => handleLangChange(l.code)}
                      disabled={!multiLang && l.code !== "th"}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                      style={lang === l.code
                        ? { background: "rgba(251,191,36,0.18)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.4)" }
                        : { background: "rgba(255,255,255,0.03)", color: "#64748b", border: "1px solid #1c2540" }}>
                      <span className="text-base">{l.flag}</span>
                      <span>{l.label}</span>
                      {lang === l.code && <Check size={12} />}
                    </button>
                  ))}
                </div>

                {/* แสดง preview ข้อความตามภาษา */}
                <div className="mt-3 px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1c2540" }}>
                  <p className="text-[10px] font-semibold mb-1" style={{ color: "#64748b" }}>PREVIEW</p>
                  <p className="text-xs text-white">
                    {lang === "th" ? "🇹🇭 หน้าเว็บแสดงเป็นภาษาไทย" : "🇬🇧 Website displayed in English"}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "#64748b" }}>
                    {lang === "th" ? "เมนู, ปุ่ม และข้อความทั้งหมดเป็นภาษาไทย" : "All menus, buttons and text in English"}
                  </p>
                </div>
              </div>

              {/* Responsive Status */}
              <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
                <div className="flex items-center gap-2 pb-3 mb-4" style={{ borderBottom: "1px solid #1c2540" }}>
                  <Monitor size={14} style={{ color: "#a78bfa", flexShrink: 0 }} />
                  <p className="text-sm font-bold text-white">Responsive Status</p>
                </div>
                <div className="space-y-2.5">
                  {BREAKPOINTS.map(bp => {
                    const Icon = bp.icon;
                    return (
                      <div key={bp.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
                        <Icon size={16} style={{ color: "#a78bfa", flexShrink: 0 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{bp.label}</p>
                          <p className="text-xs font-mono" style={{ color: "#64748b" }}>{bp.px}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <StatusDot on={bp.ok} />
                          <span className="text-xs font-semibold" style={{ color: bp.ok ? "#34d399" : "#f87171" }}>
                            {bp.ok ? "Passed" : "Failed"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-400"
                style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)" }}>
                {error}
              </div>
            )}

            {/* Save Button (Maintenance + Notifications เท่านั้น) */}
            <div className="flex justify-end pb-2">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                style={saved
                  ? { background: "rgba(52,211,153,0.2)", color: "#34d399", border: "1px solid rgba(52,211,153,0.4)" }
                  : { background: "linear-gradient(135deg,#38bdf8,#818cf8)", color: "white" }}>
                {saved   ? <><Check size={15} /> บันทึกแล้ว</>
                 : saving ? <><RefreshCw size={15} className="animate-spin" /> กำลังบันทึก...</>
                 : <><Save size={15} /> บันทึกการตั้งค่าทั้งหมด</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
