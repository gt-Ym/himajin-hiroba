"use client";

import { useState } from "react";
import Image from "next/image";
import { generateRandomName } from "@/contexts/UserContext";
import { ICONS } from "@/lib/icons";
import styles from "./UserSetup.module.css";

interface UserSetupProps {
  onEnter: (name: string, iconId: string) => void;
}

export default function UserSetup({ onEnter }: UserSetupProps) {
  const [name, setName] = useState("");
  const [selectedIconId, setSelectedIconId] = useState(ICONS[0].id);

  const handleGenerate = () => {
    setName(generateRandomName());
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onEnter(trimmed, selectedIconId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.heading}>暇人広場へようこそ</h1>
        <p className={styles.subtitle}>ニックネームとアイコンを決めて広場に入りましょう。</p>

        {/* アイコン選択 */}
        <p className={styles.sectionLabel}>アイコンを選ぶ</p>
        <div className={styles.iconGrid}>
          {ICONS.map((icon) => (
            <button
              key={icon.id}
              type="button"
              onClick={() => setSelectedIconId(icon.id)}
              className={`${styles.iconBtn} ${selectedIconId === icon.id ? styles.iconBtnSelected : ""}`}
              title={icon.label}
            >
              <Image src={icon.path} alt={icon.label} width={48} height={48} />
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <p className={styles.sectionLabel}>ニックネームを入力する</p>
          <div className={styles.inputRow}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ニックネームを入力"
              maxLength={20}
              className={styles.input}
            />
            <button type="button" onClick={handleGenerate} className={styles.generateBtn}>
              自動生成
            </button>
          </div>

          <p className={styles.hint}>
            ※ ログイン不要・足跡なし。ニックネームはいつでも変更できます。
          </p>

          <button type="submit" disabled={!name.trim()} className={styles.submitBtn}>
            広場に入る
          </button>
        </form>
      </div>
    </div>
  );
}
