'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import {
  Search, Plus, Power, RefreshCw, X,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const cardBg = { background: 'rgba(11,15,32,0.85)', border: '1px solid #1c2540' };

type Game = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  isActive: boolean;
  label: string;
  category?: { name: string };
  _count?: { packages: number };
};

type ApiStatus = { online: boolean; checkedAt: string } | null;

// ── Add Game Modal ────────────────────────────────────────────────
function AddGameModal({ onClose, onSuccess, token }: { onClose: () => void; onSuccess: () => void; token: string }) {
  const [form, setForm] = useState({ name: '', slug: '', description: '', label: 'NONE' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/games/admin`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
      onClose();
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#0d1420', border: '1px solid #1c2540' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1c2540' }}>
          <p className="text-sm font-bold text-white">เพิ่มเกมใหม่</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: '#64748b' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">ชื่อเกม *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm"
              placeholder="Mobile Legends" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Slug *</label>
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
              className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm"
              placeholder="mobile-legends" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">คำอธิบาย</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm"
              rows={2} placeholder="คำอธิบายเกม..." />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Label</label>
            <select value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
              className="w-full bg-[#0f0f1a] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 text-sm">
              <option value="NONE">None</option>
              <option value="HOT">🔥 Hot</option>
              <option value="NEW">✨ New</option>
              <option value="SALE">🏷️ Sale</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white transition"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1c2540' }}>
              ยกเลิก
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#38bdf8,#818cf8)' }}>
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function GamesAdminPage() {
  const { token } = useAdminAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [apiStatus, setApiStatus] = useState<Record<string, ApiStatus>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [checkingSlug, setCheckingSlug] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGames(res.data?.data ?? []);
    } catch {
      console.error('Failed to fetch games');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/games/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchGames();
    } catch {
      console.error('Toggle failed');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCheckApi = async (slug: string) => {
    setCheckingSlug(slug);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/${slug}/api-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApiStatus(prev => ({ ...prev, [slug]: res.data }));
    } catch {
      setApiStatus(prev => ({ ...prev, [slug]: { online: false, checkedAt: new Date().toISOString() } }));
    } finally {
      setCheckingSlug(null);
    }
  };

  const filtered = games.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.slug.toLowerCase().includes(search.toLowerCase())
  );

  const LABEL_STYLE: Record<string, { color: string; bg: string }> = {
    HOT:  { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    NEW:  { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    SALE: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    NONE: { color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
  };

  return (
    <div className="p-5 space-y-5" style={{ fontFamily: "'Noto Sans Thai',sans-serif", background: '#080a16', minHeight: '100vh' }}>

      {showAdd && <AddGameModal onClose={() => setShowAdd(false)} onSuccess={fetchGames} token={token!} />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">จัดการเกม</h1>
          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
            ทั้งหมด {games.length} เกม · เปิดอยู่ {games.filter(g => g.isActive).length} เกม
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition"
          style={{ background: 'linear-gradient(135deg,#38bdf8,#818cf8)' }}>
          <Plus size={15} /> เพิ่มเกมใหม่
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2 max-w-sm"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1e293b' }}>
        <Search size={13} style={{ color: '#64748b' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาเกม..."
          className="bg-transparent outline-none text-xs text-white placeholder-[#3a4a6a] w-full" />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={cardBg}>
        {/* Head */}
        <div className="grid text-[11px] font-bold px-5 py-3"
          style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', color: '#64748b', borderBottom: '1px solid #1c2540' }}>
          <span>เกม</span>
          <span>หมวดหมู่</span>
          <span>Label</span>
          <span>สถานะ API</span>
          <span className="text-right">การจัดการ</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">ไม่พบเกม</div>
        ) : (
          filtered.map((g, i) => {
            const ls = LABEL_STYLE[g.label] ?? LABEL_STYLE.NONE;
            const status = apiStatus[g.slug];
            return (
              <div key={g.id} className="grid items-center px-5 py-4 hover:bg-white/[0.02] transition"
                style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', borderBottom: i < filtered.length - 1 ? '1px solid #0d1525' : 'none' }}>

                {/* Game info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden"
                    style={{ background: '#1a1a2e' }}>
                    {g.image
                      ? <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">🎮</div>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{g.name}</p>
                    <p className="text-[11px]" style={{ color: '#64748b' }}>{g.slug}</p>
                  </div>
                </div>

                {/* Category */}
                <span className="text-xs" style={{ color: '#94a3b8' }}>
                  {g.category?.name ?? 'ไม่ระบุ'}
                </span>

                {/* Label */}
                <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: ls.bg, color: ls.color }}>
                  {g.label === 'NONE' ? '-' : g.label}
                </span>

                {/* API Status */}
                <div className="flex items-center gap-1.5">
                  {status === null || status === undefined ? (
                    <span className="text-[11px]" style={{ color: '#3a4a6a' }}>-</span>
                  ) : status.online ? (
                    <><CheckCircle size={13} className="text-green-400" /><span className="text-[11px] text-green-400">Online</span></>
                  ) : (
                    <><XCircle size={13} className="text-red-400" /><span className="text-[11px] text-red-400">Offline</span></>
                  )}
                  <button onClick={() => handleCheckApi(g.slug)} disabled={checkingSlug === g.slug}
                    className="p-1 rounded hover:bg-white/10 transition" style={{ color: '#64748b' }}>
                    <RefreshCw size={11} className={checkingSlug === g.slug ? 'animate-spin' : ''} />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  {/* Toggle */}
                  <button onClick={() => handleToggle(g.id)} disabled={togglingId === g.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition disabled:opacity-50"
                    style={g.isActive
                      ? { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }
                      : { background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                    <Power size={11} />
                    {togglingId === g.id ? '...' : g.isActive ? 'เปิด' : 'ปิด'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
