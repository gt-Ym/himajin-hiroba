"use client";

import { useState } from "react";
import Link from "next/link";
import { PLAZAS } from "@/lib/plazas";
import styles from "./PlazaHeader.module.css";

interface Props {
  title: string;
  onCallEveryone?: () => void;
  isCallOnCooldown?: boolean;
}

export default function PlazaHeader({ title, onCallEveryone, isCallOnCooldown }: Props) {
  const [showRoomList, setShowRoomList] = useState(false);

  return (
    <>
      <div className={styles.heading}>
        <button
          className={styles.callBtn}
          onClick={onCallEveryone}
          disabled={isCallOnCooldown}
        >
          {isCallOnCooldown ? "呼んだ！" : "みんなを呼ぶ"}
        </button>
        {title}
        <button className={styles.roomListBtn} onClick={() => setShowRoomList(true)}>
          広場を移動
        </button>
      </div>

      {showRoomList && (
        <div className={styles.modalOverlay} onClick={() => setShowRoomList(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTitle}>広場一覧</div>
            {PLAZAS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className={styles.modalItem}
                onClick={() => setShowRoomList(false)}
              >
                {p.emoji} {p.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
