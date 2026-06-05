// ── Real-time Clock Component ────────────────────────────────────
function RealtimeClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick(); // run ทันทีก่อน interval แรก
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
      style={{ background: "rgba(11,15,32,0.85)", border: "1px solid #1c2540" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span className="font-mono text-sm font-semibold tracking-widest" style={{ color: "#e2e8f0" }}>
        {time}
      </span>
    </div>
  );
}