'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { toast } from 'sonner';
import {
  Search, Plus, X, Pencil, Package,
  Download, ChevronLeft, ChevronRight, CloudUpload, Info, Gamepad2, ToggleLeft, ToggleRight, Upload,
} from 'lucide-react';

type Game = {
  id: string; name: string; slug: string; image?: string; banner?: string;
  isActive: boolean; label: string; categoryId?: string;
  category?: { id: string; name: string };
};
type Category = { id: string; name: string; slug: string };
type ApiStatus = { online: boolean } | null;

const CAT_COLOR: Record<string, { color: string; bg: string }> = {
  MOBA:            { color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
  FPS:             { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  RPG:             { color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  'Battle Royale': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  default:         { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
};
function catStyle(name?: string) { return CAT_COLOR[name ?? ''] ?? CAT_COLOR.default; }

/* ── Toggle ──────────────────────────────────────────────────── */
function Toggle({ on, loading, onToggle }: { on: boolean; loading: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} disabled={loading}
      className="relative flex-shrink-0 transition-colors duration-200"
      style={{ width: 44, height: 24, borderRadius: 12,
        background: on ? '#22c55e' : '#d1d5db',
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, border: 'none' }}>
      <span className="block absolute top-[2px] rounded-full bg-white shadow-sm transition-[left] duration-200"
        style={{ width: 20, height: 20, left: on ? 22 : 2 }} />
    </button>
  );
}

/* ── Upload Zone ─────────────────────────────────────────────── */
function UploadZone({ value, onChange, token, endpoint, aspect, label }: {
  value: string; onChange: (url: string) => void; token: string;
  endpoint: string; aspect: string; label: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, fd,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').origin;
      onChange(`${apiOrigin}${res.data.url}`);
    } catch { toast.error('อัปโหลดไม่สำเร็จ'); } finally { setUploading(false); }
  };
  return (
    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
      className="w-full rounded-xl flex flex-col items-center justify-center gap-2 transition hover:border-primary/40 bg-muted/30 border-2 border-dashed border-border/80"
      style={{ height: 120, cursor: uploading ? 'wait' : 'pointer' }}>
      {value
        ? <img src={value} alt={label} className="w-full h-full object-cover rounded-xl" />
        : <>
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primary/10">
              <CloudUpload size={18} className="text-primary" />
            </div>
            <p className="text-xs font-medium text-foreground">{uploading ? 'กำลังอัปโหลด...' : label}</p>
            <p className="text-[10px] text-muted-foreground">{aspect}</p>
          </>}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </button>
  );
}

/* ── Edit Game Modal ─────────────────────────────────────────── */
function EditGameModal({ game, categories, onClose, onSuccess, token }: {
  game: Game; categories: Category[]; onClose: () => void; onSuccess: () => void; token: string;
}) {
  const [form, setForm] = useState({
    name: game.name, image: game.image ?? '', banner: game.banner ?? '',
    label: game.label, categoryId: game.categoryId ?? '',
  });
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/${game.slug}/api-status`,
      { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setApiOnline(r.data?.online ?? false))
      .catch(() => setApiOnline(false));
  }, [game.slug, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/games/${game.id}`,
        { ...form, categoryId: form.categoryId || null },
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('บันทึกสำเร็จ');
      onSuccess(); onClose();
    } catch { toast.error('เกิดข้อผิดพลาด'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col bg-card text-card-foreground border border-border shadow-2xl"
        style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-bold text-foreground">แก้ไขข้อมูลเกม — {game.name}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition">
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Name & Label */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">ชื่อเกม *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                placeholder="เช่น Garena Free Fire"
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">ป้ายกำกับ (Label)</label>
              <div className="relative">
                <select value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
                  className="w-full appearance-none px-3 py-2.5 rounded-xl text-sm font-semibold bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="NONE">ไม่มีป้ายกำกับ</option>
                  <option value="HOT">🔥 HOT</option>
                  <option value="NEW">✨ NEW</option>
                  <option value="SALE">💰 SALE</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▾</span>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">หมวดหมู่เกม</label>
            <div className="relative">
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
                className="w-full appearance-none px-3 py-2.5 rounded-xl text-sm font-semibold bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">ไม่ระบุ</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▾</span>
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">รูปโลโก้</label>
              <UploadZone value={form.image} onChange={url => setForm({ ...form, image: url })} token={token}
                endpoint="/upload/game-image" aspect="PNG, JPG (1:1)" label="อัปโหลดโลโก้" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">รูป Banner</label>
              <UploadZone value={form.banner} onChange={url => setForm({ ...form, banner: url })} token={token}
                endpoint="/upload/game-image" aspect="1200 x 630 px" label="อัปโหลด Banner" />
            </div>
          </div>

          {/* API Status */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border/60">
            <Info size={14} className="text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">สถานะ API</p>
              <p className="text-[10px] text-muted-foreground">ระบบตรวจสอบอัตโนมัติ</p>
            </div>
            {apiOnline === null
              ? <span className="text-xs text-muted-foreground">กำลังตรวจ...</span>
              : <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  apiOnline
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${apiOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {apiOnline ? 'Online' : 'Offline'}
                </span>
            }
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-muted/40 border border-border hover:bg-muted transition">
              ยกเลิก
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition shadow-sm">
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Add Game Modal ──────────────────────────────────────────── */
function AddGameModal({ categories, onClose, onSuccess, token }: {
  categories: Category[]; onClose: () => void; onSuccess: () => void; token: string;
}) {
  const [form, setForm] = useState({ name: '', slug: '', label: 'NONE', categoryId: '', image: '' });
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/games/admin`,
        { ...form, categoryId: form.categoryId || null },
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('เพิ่มเกมสำเร็จ');
      onSuccess(); onClose();
    } catch { toast.error('เกิดข้อผิดพลาด'); } finally { setLoading(false); }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload/game-image`, fd,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').origin;
      setForm(f => ({ ...f, image: `${apiOrigin}${res.data.url}` }));
    } catch { toast.error('อัปโหลดไม่สำเร็จ'); } finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-card text-card-foreground border border-border shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-bold text-foreground">เพิ่มเกมใหม่</p>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">ชื่อเกม *</label>
            <input value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} required
              placeholder="Mobile Legends"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Slug *</label>
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required placeholder="mobile-legends"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-muted/40 border border-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 transition" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">หมวดหมู่</label>
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition">
              <option value="">ไม่ระบุ</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">โลโก้เกม</label>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full h-20 rounded-xl flex flex-col items-center justify-center gap-1.5 bg-muted/30 border-2 border-dashed border-border/80 hover:border-primary/40 transition">
              {form.image ? <img src={form.image} alt="" className="h-full object-contain rounded-xl" />
                : <><Upload size={14} className="text-primary" />
                   <span className="text-xs text-muted-foreground">{uploading ? 'กำลังอัปโหลด...' : 'คลิกเพื่ออัปโหลด'}</span></>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-muted/40 border border-border hover:bg-muted transition">
              ยกเลิก
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition shadow-sm">
              {loading ? 'กำลังบันทึก...' : 'เพิ่มเกม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Game Card (mobile) ──────────────────────────────────────── */
function GameCard({ g, onEdit, onPackage, onToggle, toggling }: {
  g: Game; onEdit: () => void; onPackage: () => void;
  onToggle: () => void; toggling: boolean;
}) {
  const cs = catStyle(g.category?.name);
  return (
    <div className="rounded-xl p-4 bg-card border border-border/80 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center bg-muted/40 border border-border/60">
          {g.image ? <img src={g.image} alt={g.name} className="w-full h-full object-cover" /> : <span className="text-lg">🎮</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground truncate">{g.name}</p>
            {g.label !== 'NONE' && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold text-white ${
                g.label === 'HOT' ? 'bg-red-500' : g.label === 'NEW' ? 'bg-blue-500' : 'bg-orange-500'
              }`}>{g.label}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {g.category?.name && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                style={{ background: cs.bg, color: cs.color }}>{g.category.name}</span>
            )}
            <span className="text-[10px] text-muted-foreground font-mono">{g.slug}</span>
          </div>
        </div>
        <Toggle on={g.isActive} loading={toggling} onToggle={onToggle} />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={onPackage}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition">
          <Package size={12} /> แพ็กเกจ
        </button>
        <button onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-muted/40 text-muted-foreground border border-border hover:bg-muted transition">
          <Pencil size={12} /> แก้ไข
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
const PAGE_SIZE = 10;

export default function GamesAdminPage() {
  const { token, _hydrated } = useAdminAuth();
  const router = useRouter();
  const [games, setGames]           = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [catFilter, setCatFilter]   = useState('ทั้งหมด');
  const [page, setPage]             = useState(1);
  const [showAdd, setShowAdd]       = useState(false);
  const [editGame, setEditGame]     = useState<Game | null>(null);
  const [apiStatus, setApiStatus]   = useState<Record<string, ApiStatus>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const checkedRef = useRef<Set<string>>(new Set());

  const fetchGames = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [gRes, cRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/admin/all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setGames(gRes.data?.data ?? []);
      const cData = cRes.data;
      setCategories(Array.isArray(cData) ? cData : (cData?.data ?? []));
    } catch { console.error('fetch error'); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (_hydrated && token) fetchGames(); }, [_hydrated, token]);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/games/${id}/toggle`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setGames(prev => prev.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g));
      toast.success('เปลี่ยนสถานะสำเร็จ');
    } catch { toast.error('เปลี่ยนสถานะไม่สำเร็จ'); } finally { setTogglingId(null); }
  };

  const checkApiStatus = useCallback(async (slug: string) => {
    if (checkedRef.current.has(slug)) return;
    checkedRef.current.add(slug);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/${slug}/api-status`,
        { headers: { Authorization: `Bearer ${token}` } });
      setApiStatus(prev => ({ ...prev, [slug]: { online: res.data?.online ?? false } }));
    } catch { setApiStatus(prev => ({ ...prev, [slug]: { online: false } })); }
  }, [token]);

  const filtered = games.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.slug.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'ทั้งหมด' || g.category?.name === catFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, catFilter]);
  useEffect(() => { paginated.forEach(g => checkApiStatus(g.slug)); }, [paginated.map(g => g.slug).join(',')]);

  const activeCount   = games.filter(g => g.isActive).length;
  const inactiveCount = games.filter(g => !g.isActive).length;
  const apiErrCount   = Object.values(apiStatus).filter(s => s && !s.online).length;

  const handleExport = () => {
    const rows = [['ชื่อเกม', 'Slug', 'หมวดหมู่', 'สถานะ', 'Label']];
    filtered.forEach(g => rows.push([g.name, g.slug, g.category?.name ?? '', g.isActive ? 'เปิด' : 'ปิด', g.label]));
    const csv = '\ufeff' + rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `games_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const catOptions = ['ทั้งหมด', ...Array.from(new Set(games.map(g => g.category?.name).filter(Boolean) as string[]))];

  if (!_hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Noto Sans Thai',sans-serif" }}>
      {showAdd && <AddGameModal categories={categories} onClose={() => setShowAdd(false)} onSuccess={fetchGames} token={token!} />}
      {editGame && <EditGameModal game={editGame} categories={categories} onClose={() => setEditGame(null)} onSuccess={fetchGames} token={token!} />}

      <div className="p-3 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-bold text-foreground">จัดการเกม</h1>
            <p className="text-[10px] mt-0.5 text-muted-foreground">จัดการเกม, แพ็กเกจ และข้อมูลเกม</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-sm transition">
            <Plus size={14} /> เพิ่มเกม
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'เกมทั้งหมด', value: games.length, icon: Gamepad2, accent: '#3b82f6' },
            { label: 'เปิดบริการ', value: activeCount, icon: ToggleRight, accent: '#22c55e' },
            { label: 'ปิดปรับปรุง', value: inactiveCount, icon: ToggleLeft, accent: '#f59e0b' },
            { label: 'API Error', value: apiErrCount, icon: X, accent: '#ef4444' },
          ].map(c => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="bg-card border border-border/80 rounded-2xl p-3 sm:p-4 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(circle at 85% 15%, ${c.accent}10, transparent 65%)` }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[10px] font-semibold text-muted-foreground">{c.label}</p>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${c.accent}cc,${c.accent}66)` }}>
                      <Icon size={14} color="#fff" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-foreground leading-none mb-1">{c.value}</p>
                  <p className="text-[9px] text-muted-foreground/60">
                    {c.label === 'เกมทั้งหมด' ? 'รายการ' : c.label === 'API Error' ? 'จุด' : 'เกม'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-0 bg-muted/40 border border-border/60 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all">
            <Search size={13} className="text-muted-foreground flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเกม..."
              className="bg-transparent outline-none text-xs text-foreground placeholder-muted-foreground/60 flex-1 min-w-0" />
            {search && <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground transition"><X size={12} /></button>}
          </div>
          <div className="relative">
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-semibold text-foreground bg-muted/40 border border-border/60 focus:outline-none">
              {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▾</span>
          </div>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-muted/40 text-muted-foreground border border-border/60 hover:bg-muted transition">
            <Download size={12} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl p-4 animate-pulse bg-card border border-border/60">
                <div className="flex gap-3">
                  <div className="w-11 h-11 rounded-xl bg-muted/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 rounded bg-muted/60" />
                    <div className="h-2 w-20 rounded bg-muted/60" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">ไม่พบเกม</div>
        ) : (
          <>
            {/* Mobile: Cards */}
            <div className="sm:hidden space-y-2">
              {paginated.map(g => (
                <GameCard key={g.id} g={g}
                  onEdit={() => setEditGame(g)}
                  onPackage={() => router.push(`/admin/games/${g.id}/packages`)}
                  onToggle={() => handleToggle(g.id)}
                  toggling={togglingId === g.id} />
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden sm:block rounded-2xl overflow-hidden bg-card border border-border/80 shadow-sm">
              <div className="grid text-[10px] font-bold uppercase tracking-wider px-5 py-3 gap-4 text-muted-foreground border-b border-border/60"
                style={{ gridTemplateColumns: '2.5fr 1fr 1fr 0.8fr 100px' }}>
                <span>ชื่อเกม</span><span>หมวดหมู่</span><span>API</span>
                <span>สถานะ</span><span className="text-right">จัดการ</span>
              </div>
              {paginated.map((g, i) => {
                const cs = catStyle(g.category?.name);
                const st = apiStatus[g.slug];
                return (
                  <div key={g.id} className="grid items-center px-5 py-3.5 gap-4 hover:bg-muted/30 transition duration-150"
                    style={{ gridTemplateColumns: '2.5fr 1fr 1fr 0.8fr 100px',
                      borderBottom: i < paginated.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    {/* Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center bg-muted/40 border border-border/60">
                        {g.image ? <img src={g.image} alt={g.name} className="w-full h-full object-cover" /> : <span className="text-sm">🎮</span>}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-foreground truncate">{g.name}</p>
                          {g.label !== 'NONE' && (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold text-white ${
                              g.label === 'HOT' ? 'bg-red-500' : g.label === 'NEW' ? 'bg-blue-500' : 'bg-orange-500'
                            }`}>{g.label}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate">{g.slug}</p>
                      </div>
                    </div>
                    {/* Category */}
                    {g.category?.name
                      ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold w-fit"
                          style={{ background: cs.bg, color: cs.color }}>{g.category.name}</span>
                      : <span className="text-muted-foreground/40">—</span>}
                    {/* API */}
                    <div>
                      {st == null
                        ? <span className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-pulse inline-block" />
                        : <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            st.online
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.online ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {st.online ? 'Online' : 'Offline'}
                          </span>
                      }
                    </div>
                    {/* Toggle */}
                    <Toggle on={g.isActive} loading={togglingId === g.id} onToggle={() => handleToggle(g.id)} />
                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => router.push(`/admin/games/${g.id}/packages`)} title="จัดการแพ็กเกจ"
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition cursor-pointer">
                        <Package size={13} />
                      </button>
                      <button onClick={() => setEditGame(g)} title="แก้ไขข้อมูลเกม"
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/60 text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition cursor-pointer">
                        <Pencil size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} เกม
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 border border-border text-muted-foreground hover:bg-muted transition">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold border transition ${
                      p === page
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'text-muted-foreground border-border hover:bg-muted'
                    }`}>{p}</button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 border border-border text-muted-foreground hover:bg-muted transition">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
