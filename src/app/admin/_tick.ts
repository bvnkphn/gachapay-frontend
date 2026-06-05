  // ── จุดที่ 2: useEffect นับวิทุกวินาที ───────────────────────
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`
      );
    };
    tick(); // ✅ เรียกทันทีก่อน interval แรก
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);