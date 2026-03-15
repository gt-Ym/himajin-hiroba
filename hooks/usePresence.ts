import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";

export type Participant = { username: string; iconId: string; uuid: string };
export type Notification = { id: number; message: string };

export const ANIMATION_DURATION = 10000;
const CALL_COOLDOWN_MS = 10000;

export function usePresence() {
  const { user } = useUser();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isCallOnCooldown, setIsCallOnCooldown] = useState(false);
  const prevParticipantsRef = useRef<Participant[]>([]);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const notificationQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const cleanupRef = useRef(false);

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

    presenceChannel
      .on("broadcast", { event: "call" }, (payload) => {
        const { username, plazaName } = payload.payload as { username: string; plazaName: string };
        addNotification(`${username}さんが${plazaName}にみんなを呼んでいます!!`);
      })
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState<Participant>();
        const seen = new Set<string>();
        const next = Object.values(state)
          .flatMap((presences) => presences)
          .filter((p) => {
            if (seen.has(p.uuid)) return false;
            seen.add(p.uuid);
            return true;
          });
        const prev = prevParticipantsRef.current;
        if (prev.length === 0) {
          const self = next.find((p) => p.uuid === user.uuid);
          if (self) addNotification(`${self.username} さんが参加しました！`);
        } else {
          next.filter((p) => !prev.some((q) => q.uuid === p.uuid))
            .forEach((p) => addNotification(`${p.username} さんが参加しました！`));
          prev.filter((p) => !next.some((q) => q.uuid === p.uuid))
            .forEach((p) => addNotification(`${p.username} さんが退出しました...`));
        }
        prevParticipantsRef.current = next;
        setParticipants(next);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            username: user.name,
            iconId: user.iconId,
            uuid: user.uuid,
          });
        }
      });

    return () => {
      cleanupRef.current = true;
      notificationQueueRef.current = [];
      isPlayingRef.current = false;
      supabase.removeChannel(presenceChannel);
      presenceChannelRef.current = null;
      prevParticipantsRef.current = [];
    };
  }, [user]);

  return { participants, notifications, callEveryone, isCallOnCooldown };
}
