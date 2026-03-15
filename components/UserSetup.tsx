"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { generateRandomName } from "@/contexts/UserContext";
import { ICONS } from "@/lib/icons";
import styles from "./UserSetup.module.css";

const ICONS_PER_PAGE = 20;
const TOTAL_PAGES = Math.ceil(ICONS.length / ICONS_PER_PAGE);

interface UserSetupProps {
  onEnter: (name: string, iconId: string) => void;
}

export default function UserSetup({ onEnter }: UserSetupProps) {
  const [name, setName] = useState("");
  const [selectedIconId, setSelectedIconId] = useState(ICONS[0].id);
  const [showIconModal, setShowIconModal] = useState(false);
  const [tempIconId, setTempIconId] = useState(ICONS[0].id);
  const [page, setPage] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleGenerate = () => {
    setName(generateRandomName());
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onEnter(trimmed, selectedIconId);
  };

  const openModal = () => {
    setTempIconId(selectedIconId);
    const idx = ICONS.findIndex((i) => i.id === selectedIconId);
    setPage(Math.floor(idx / ICONS_PER_PAGE));
    setShowIconModal(true);
  };

  const handleConfirm = () => {
    setSelectedIconId(tempIconId);
    setShowIconModal(false);
  };

  const handleCancel = () => {
    setShowIconModal(false);
  };

  const selectedIcon = ICONS.find((i) => i.id === selectedIconId)!;
  const pagedIcons = ICONS.slice(page * ICONS_PER_PAGE, (page + 1) * ICONS_PER_PAGE);

  const modal = (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p className={styles.modalTitle}>アイコンを選んでください</p>

        {/* カルーセル */}
        <div className={styles.carousel}>
          <button
            type="button"
            className={styles.carouselBtn}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
          >
            ‹
          </button>

          <div className={styles.iconGrid}>
            {pagedIcons.map((icon) => (
              <button
                key={icon.id}
                type="button"
                onClick={() => setTempIconId(icon.id)}
                className={`${styles.iconBtn} ${tempIconId === icon.id ? styles.iconBtnSelected : ""}`}
                title={icon.label}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon.path} alt={icon.label} width={44} height={44} />
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles.carouselBtn}
            onClick={() => setPage((p) => Math.min(p + 1, TOTAL_PAGES - 1))}
            disabled={page === TOTAL_PAGES - 1}
          >
            ›
          </button>
        </div>

        {/* ページドット */}
        <div className={styles.pageDots}>
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === page ? styles.dotActive : ""}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>

        <div className={styles.modalActions}>
          <button type="button" onClick={handleCancel} className={styles.cancelBtn}>
            キャンセル
          </button>
          <button type="button" onClick={handleConfirm} className={styles.confirmBtn}>
            決定
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.heading}>暇人広場へようこそ</h1>
          <p className={styles.subtitle}>ニックネームとアイコンを決めて広場に入りましょう。</p>

          {/* アイコン表示 */}
          <p className={styles.sectionLabel}>アイコンを選ぶ</p>
          <div className={styles.iconRow}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedIcon.path}
              alt={selectedIcon.label}
              width={64}
              height={64}
              className={styles.selectedIcon}
            />
            <button type="button" onClick={openModal} className={styles.changeIconBtn}>
              アイコンを変更
            </button>
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

      {/* モーダルはbody直下にポータルで描画 */}
      {mounted && showIconModal && createPortal(modal, document.body)}
    </>
  );
}
