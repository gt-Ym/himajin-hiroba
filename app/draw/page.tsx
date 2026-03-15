"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { usePresence } from "@/hooks/usePresence";
import { useDraw, CANVAS_W, CANVAS_H } from "@/hooks/useDraw";
import PlazaHeader from "@/components/PlazaHeader";
import NotificationBar from "@/components/NotificationBar";
import ParticipantBar from "@/components/ParticipantBar";
import styles from "./draw.module.css";

const ROOMS = [
  { id: 1, label: "お絵描き広場1" },
  { id: 2, label: "お絵描き広場2" },
  { id: 3, label: "お絵描き広場3" },
] as const;

type RoomId = typeof ROOMS[number]["id"];

const COLORS = [
  "#000000", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ffffff",
];

const LINE_WIDTHS = [3, 8, 16];

export default function DrawPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { participants, notifications, callEveryone, isCallOnCooldown, notifyNavigation } = usePresence("お絵描き広場");

  const [activeRoom, setActiveRoom] = useState<RoomId>(1);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const { canvasRef, onStart, onMove, onEnd } = useDraw(activeRoom);

  useEffect(() => {
    if (isLoaded && !user) router.replace("/");
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <PlazaHeader
          title="お絵描き広場"
          onCallEveryone={() => callEveryone("お絵描き広場")}
          isCallOnCooldown={isCallOnCooldown}
          onNavigate={notifyNavigation}
        />
        <NotificationBar notifications={notifications} />
        <ParticipantBar participants={participants} />

        {/* タブ */}
        <div className={styles.tabs}>
          {ROOMS.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRoom(r.id)}
              className={`${styles.tab} ${r.id === 1 ? styles.tabRoom1 : r.id === 2 ? styles.tabRoom2 : styles.tabRoom3} ${activeRoom === r.id ? styles.tabActive : ""}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* キャンバス */}
        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className={styles.canvas}
            onMouseDown={(e) => onStart(e.clientX, e.clientY)}
            onMouseMove={(e) => onMove(e.clientX, e.clientY, color, lineWidth)}
            onMouseUp={onEnd}
            onMouseLeave={onEnd}
            onTouchStart={(e) => { const t = e.touches[0]; onStart(t.clientX, t.clientY); }}
            onTouchMove={(e) => { const t = e.touches[0]; onMove(t.clientX, t.clientY, color, lineWidth); }}
            onTouchEnd={onEnd}
          />
        </div>

        {/* ツールバー */}
        <div className={styles.toolbar}>
          <div className={styles.colors}>
            {COLORS.map((c) => (
              <button
                key={c}
                className={`${styles.colorBtn} ${color === c ? styles.colorBtnActive : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={c === "#ffffff" ? "消しゴム" : c}
              />
            ))}
          </div>
          <div className={styles.widths}>
            {LINE_WIDTHS.map((w) => (
              <button
                key={w}
                className={`${styles.widthBtn} ${lineWidth === w ? styles.widthBtnActive : ""}`}
                onClick={() => setLineWidth(w)}
                aria-label={`太さ${w}`}
              >
                <span style={{ width: w * 2, height: w * 2, borderRadius: "50%", background: "#374151", display: "block" }} />
              </button>
            ))}
          </div>
        </div>

      </div>
      <p className={styles.notice}>※ 1時間に1回、お絵描きの内容がすべて削除されます</p>
    </div>
  );
}
