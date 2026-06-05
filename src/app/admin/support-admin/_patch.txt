                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Toggle Switch */}
                            <button onClick={() => toggleFaqActive(faq)}
                              style={{
                                position: "relative", width: 44, height: 24, borderRadius: 12,
                                background: faq.isActive ? "#34d399" : "#334155",
                                border: "none", cursor: "pointer", flexShrink: 0,
                                transition: "background 0.2s",
                              }}>
                              <span style={{
                                position: "absolute", top: 2,
                                left: faq.isActive ? 22 : 2,
                                width: 20, height: 20, borderRadius: "50%",
                                background: "white",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                transition: "left 0.2s", display: "block",
                              }} />
                            </button>
                            <button onClick={() => { setEditFaqId(faq.id); setShowNewFaq(false); }}
                              className="p-2 rounded-lg hover:bg-white/10" style={{ color: "#94a3b8" }}>
                              <Edit3 size={13} />
                            </button>
                            <button onClick={() => deleteFaq(faq.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10" style={{ color: "#f87171" }}>
                              <Trash2 size={13} />
                            </button>
                          </div>