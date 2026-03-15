"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { usePresence } from "@/hooks/usePresence";
import PlazaHeader from "@/components/PlazaHeader";
import NotificationBar from "@/components/NotificationBar";
import ParticipantBar from "@/components/ParticipantBar";
import styles from "./shiritori.module.css";

const ROOMS = [
  { id: 1, label: "しりとり広場1" },
  { id: 2, label: "しりとり広場2" },
  { id: 3, label: "しりとり広場3" },
] as const;

type RoomId = typeof ROOMS[number]["id"];

export default function ShiritoriPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { participants, notifications, callEveryone, isCallOnCooldown, notifyNavigation } = usePresence("しりとり広場");
  const [activeRoom, setActiveRoom] = useState<RoomId>(1);

  useEffect(() => {
    if (isLoaded && !user) router.replace("/");
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <PlazaHeader
          title="しりとり広場"
          onCallEveryone={() => callEveryone("しりとり広場")}
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

        {/* コンテンツ */}
        <div className={`${styles.content} ${activeRoom === 2 ? styles.contentRoom2 : activeRoom === 3 ? styles.contentRoom3 : ""}`}>
          <p className={styles.wip}>🔤 実装中です</p>
        </div>
      </div>
    </div>
  );
}
