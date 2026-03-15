import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";

export type Participant = { username: string; iconId: string; uuid: string };
export type Notification = { id: number; message: string };

export const ANIMATION_DURATION = 10000;
const CALL_COOLDOWN_MS = 10000;

export function usePresence(plazaName: string) {
  const { user } = useUser();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isCallOnCooldown, setIsCallOnCooldown] = useState(false);
  const prevParticipantsRef = useRef<Participant[]>([]);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const notificationQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const cleanupRef = useRef(false);
  const pendingLeavesRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const navigatingUsersRef = useRef<Map<string, string>>(new Map());
  const LEAVE_DELAY_MS = 10000;

  const notifyNavigation = (destPlazaName: string) => {
    if (!presenceChannelRef.current || !user) return;
    presenceChannelRef.current.send({
      type: "broadcast",
      event: "plaza_navigate",
      payload: { uuid: user.uuid, destPlazaName },
    });
  };

  const playNext = () => {
    if (notificationQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }
    isPlayingRef.current = true;
    const message = notificationQueueRef.current.shift()!;
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      if (cleanupRef.current) return;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      playNext();
    }, ANIMATION_DURATION);
  };

  const addNotification = (message: string) => {
    notificationQueueRef.current.push(message);
    if (!isPlayingRef.current) {
      playNext();
    }
  };

  const callEveryone = (plazaName: string) => {
    if (isCallOnCooldown || !presenceChannelRef.current || !user) return;
    presenceChannelRef.current.send({
      type: "broadcast",
      event: "call",
      payload: { username: user.name, plazaName },
    });
    setIsCallOnCooldown(true);
    setTimeout(() => setIsCallOnCooldown(false), CALL_COOLDOWN_MS);
  };

  useEffect(() => {
    if (!user) return;
    cleanupRef.current = false;

    const presenceChannel = supabase.channel("himajin_presence", {
      config: { broadcast: { self: true } },
    });
    presenceChannelRef.current = presenceChannel;

    let hasTracked = false;

    presenceChannel
      .on("broadcast", { event: "call" }, (payload) => {
        const { username, plazaName } = payload.payload as { username: string; plazaName: string };
        addNotification(`${username}さんが${plazaName}にみんなを呼んでいます!!`);
      })
      .on("broadcast", { event: "plaza_navigate" }, (payload) => {
        const { uuid, destPlazaName } = payload.payload as { uuid: string; destPlazaName: string };
        navigatingUsersRef.current.set(uuid, destPlazaName);
      })
      .on("presence", { event: "sync" }, () => {
        // 参加者リストの更新のみ（通知はjoin/leaveイベントで行う）
        const state = presenceChannel.presenceState<Participant>();
        const seen = new Set<string>();
        const next = Object.values(state)
          .flatMap((presences) => presences)
          .filter((p) => {
            if (seen.has(p.uuid)) return false;
            seen.add(p.uuid);
            return true;
          });
        prevParticipantsRef.current = next;
        setParticipants(next);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        // track()前の初回join（ページロード時の既存参加者）は通知しない
        if (!hasTracked) return;

        (newPresences as unknown as Participant[])
          .filter((p) => p.uuid !== user.uuid)
          .forEach((p) => {
            // 広場移動中のユーザー → syncより先にjoinが来てもprevParticipantsRefに残っているため最初にチェック
            const destPlazaName = navigatingUsersRef.current.get(p.uuid);
            if (destPlazaName !== undefined) {
              navigatingUsersRef.current.delete(p.uuid);
              const pending = pendingLeavesRef.current.get(p.uuid);
              if (pending !== undefined) {
                clearTimeout(pending);
                pendingLeavesRef.current.delete(p.uuid);
              }
              addNotification(`${p.username} さんが${destPlazaName}に参加しました！`);
              return;
            }

            // prevParticipantsRefに既存 → リロード等でjoinがleaveより先に来たケース → 通知なし
            // ※ join は sync より先に発火するため、prevParticipantsRef は前回sync時の状態を保持
            if (prevParticipantsRef.current.some((q) => q.uuid === p.uuid)) return;

            // リロード等でleaveが先に来ていた場合 → タイマーキャンセル・通知なし
            const pending = pendingLeavesRef.current.get(p.uuid);
            if (pending !== undefined) {
              clearTimeout(pending);
              pendingLeavesRef.current.delete(p.uuid);
              return;
            }

            // 新規参加
            addNotification(`${p.username} さんが${plazaName}に参加しました！`);
          });
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        if (!hasTracked) return;

        // leave時点のステートで同UUIDがまだ存在するか確認（ハードリロードの遅延leave検出）
        const currentUuids = new Set(
          Object.values(presenceChannel.presenceState<{ uuid: string }>())
            .flatMap((p) => p)
            .map((p) => p.uuid)
        );

        (leftPresences as unknown as Participant[])
          .filter((p) => p.uuid !== user.uuid)
          .forEach((p) => {
            // 同UUIDが別コネクションでまだ存在 → 旧コネクションの遅延leave → 通知なし
            if (currentUuids.has(p.uuid)) return;

            // 広場移動中のユーザー → 退出通知なし（joinで参加通知を出す）
            if (navigatingUsersRef.current.has(p.uuid)) return;

            // 本当の退出候補 → SPA遷移の可能性があるので遅延
            const timer = setTimeout(() => {
              pendingLeavesRef.current.delete(p.uuid);
              addNotification(`${p.username} さんが${plazaName}を退出しました...`);
            }, LEAVE_DELAY_MS);
            pendingLeavesRef.current.set(p.uuid, timer);
          });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            username: user.name,
            iconId: user.iconId,
            uuid: user.uuid,
          });
          hasTracked = true;
        }
      });

    return () => {
      cleanupRef.current = true;
      notificationQueueRef.current = [];
      isPlayingRef.current = false;
      pendingLeavesRef.current.forEach((timer) => clearTimeout(timer));
      pendingLeavesRef.current.clear();
      supabase.removeChannel(presenceChannel);
      presenceChannelRef.current = null;
      prevParticipantsRef.current = [];
    };
  }, [user]);

  return { participants, notifications, callEveryone, isCallOnCooldown, notifyNavigation };
}
