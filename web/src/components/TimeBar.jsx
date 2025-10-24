import React from "react";

export default function TimerBar({ remainingSec, totalSec, onReset }) {
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, "0");
  const ss = String(remainingSec % 60).padStart(2, "0");
  const pct = Math.max(0, Math.min(100, (remainingSec / totalSec) * 100));

  return (
    <div
      style={{
        position: "sticky",  
        top: 0,
        zIndex: 1000,
        background: "#111",
        color: "#fff",
        padding: "10px 16px",
        marginBottom: 12,
        borderBottom: "1px solid #333",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <strong>Time Remaining:</strong>
        <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 18 }}>
          {mm}:{ss}
        </span>
        <div style={{ flex: 1, height: 8, background: "#333", borderRadius: 4 }}>
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: pct < 10 ? "#e53935" : "#4caf50",
              transition: "width 1s linear",
              borderRadius: 4,
            }}
          />
        </div>
        {onReset && (
          <button
            onClick={onReset}
            style={{
              padding: "6px 10px",
              fontSize: 12,
              background: "#444",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
            title="Reset timer (dev helper)"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
