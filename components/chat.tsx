"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import UserSetup from "@/components/UserSetup";
import { supabase, type ChatMessage } from "@/lib/supabase";
import { getIconPath } from "@/lib/icons";
import { usePresence } from "@/hooks/usePresence";
import PlazaHeader from "@/components/PlazaHeader";
import NotificationBar from "@/components/NotificationBar";
import ParticipantBar from "@/components/ParticipantBar";
import styles from "./chat.module.css";

const RATE_LIMIT_MS = 5000;

const ROOMS = [
  { id: 1, label: "雑談広場1", table: "chat_messages" },
  { id: 2, label: "雑談広場2", table: "chat_messages_2" },
  { id: 3, label: "雑談広場3", table: "chat_messages_3" },
] as const;

type RoomId = typeof ROOMS[number]["id"];

const initialCache: Record<RoomId, ChatMessage[]> = { 1: [], 2: [], 3: [] };

export default function Chat() {
  const { user, isLoaded, saveUser } = useUser();
  const { participants, notifications, callEveryone, isCallOnCooldown } = usePresence();
  const [activeRoom, setActiveRoom] = useState<RoomId>(1);
  const [allMessages, setAllMessages] = useState<Record<RoomId, ChatMessage[]>>(initialCache);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastSentAt, setLastSentAt] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);

  const currentTable = ROOMS.find((r) => r.id === activeRoom)!.table;
  const messages = allMessages[activeRoom];

  const switchRoom = (deltaX: number) => {
    if (Math.abs(deltaX) < 50) return;
    setActiveRoom((prev) => {
      const idx = ROOMS.findIndex((r) => r.id === prev);
      if (deltaX < 0) return ROOMS[Math.min(idx + 1, ROOMS.length - 1)].id;
      return ROOMS[Math.max(idx - 1, 0)].id;
    });
  };

  const onDragStart = (x: number) => { dragStartX.current = x; };
  const onDragEnd = (x: number) => {
    if (dragStartX.current === null) return;
    switchRoom(x - dragStartX.current);
    dragStartX.current = null;
  };

  // 起動時に全広場を一括取得・一括購読
  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      await Promise.all(
        ROOMS.map(async (room) => {
          const { data } = await supabase
            .from(room.table)
            .select("*")
            .order("created_at", { ascending: true })
            .limit(100);
          if (data) {
            setAllMessages((prev) => ({ ...prev, [room.id]: data }));
          }
        })
      );
      setLoading(false);
    };

    fetchAll();

    const channels = ROOMS.map((room) =>
      supabase
        .channel(`${room.table}_changes`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: room.table },
          (payload) => {
            setAllMessages((prev) => ({
              ...prev,
              [room.id]: [...prev[room.id], payload.new as ChatMessage],
            }));
          }
        )
        .subscribe()
    );

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [user]);

  // 新メッセージで自動スクロール（アクティブなルームのみ）
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !user) return;

    const now = Date.now();
    if (now - lastSentAt < RATE_LIMIT_MS) {
      alert(`${RATE_LIMIT_MS / 1000}秒待ってから送信してください`);
      return;
    }

    setIsSending(true);
    const { error } = await supabase.from(currentTable).insert({
      username: user.name,
      icon_id: user.iconId,
      content: trimmed,
    });

    if (!error) {
      setInput("");
      setLastSentAt(Date.now());
    }
    setIsSending(false);
  };

  if (!isLoaded) return null;
  if (!user) return <UserSetup onEnter={(name, iconId) => saveUser(name, iconId)} />;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <PlazaHeader title="雑談広場" onCallEveryone={() => callEveryone("雑談広場")} isCallOnCooldown={isCallOnCooldown} />
        <NotificationBar notifications={notifications} />
        <ParticipantBar participants={participants} />

        {/* タブ */}
        <div className={styles.tabs}>
          {ROOMS.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`${styles.tab} ${activeRoom === room.id ? styles.tabActive : ""}`}
            >
              {room.label}
            </button>
          ))}
        </div>

        {/* メッセージエリア */}
        <div
          className={`${styles.messages} ${activeRoom === 2 ? styles.messagesRoom2 : activeRoom === 3 ? styles.messagesRoom3 : ""}`}
          onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
          onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
          onMouseDown={(e) => onDragStart(e.clientX)}
          onMouseUp={(e) => onDragEnd(e.clientX)}
        >
          {loading && <p className={styles.empty}>読み込み中...</p>}
          {!loading && messages.length === 0 && (
            <p className={styles.empty}>まだメッセージはありません。最初の一言をどうぞ！</p>
          )}
          {messages.map((msg) => {
            const isMe = msg.username === user.name;
            return (
              <div
                key={msg.id}
                className={`${styles.messageWrapper} ${isMe ? styles.messageWrapperMe : styles.messageWrapperOther}`}
              >
                {!isMe && (
                  <Image
                    src={getIconPath(msg.icon_id)}
                    alt={msg.username}
                    width={36}
                    height={36}
                    className={styles.messageIcon}
                  />
                )}
                <div className={styles.messageContent}>
                  <div className={styles.meta}>
                    {!isMe && <span className={styles.metaName}>{msg.username}</span>}
                    <span>{formatTime(msg.created_at)}</span>
                    {isMe && <span className={styles.metaName}>{msg.username}</span>}
                  </div>
                  <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleOther}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 入力フォーム */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className={styles.form}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            maxLength={200}
            disabled={isSending}
            className={styles.input}
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className={styles.sendBtn}
          >
            送信
          </button>
        </form>

      </div>
    </div>
  );
}
