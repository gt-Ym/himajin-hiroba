"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { usePresence } from "@/hooks/usePresence";
import PlazaHeader from "@/components/PlazaHeader";
import NotificationBar from "@/components/NotificationBar";
import ParticipantBar from "@/components/ParticipantBar";
import styles from "./draw.module.css";

export default function DrawPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { participants, notifications, callEveryone, isCallOnCooldown, notifyNavigation } = usePresence("お絵描き広場");

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace("/");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) return null;
  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <PlazaHeader title="お絵描き広場" onCallEveryone={() => callEveryone("お絵描き広場")} isCallOnCooldown={isCallOnCooldown} onNavigate={notifyNavigation} />
        <NotificationBar notifications={notifications} />
        <ParticipantBar participants={participants} />

        <div className={styles.content}>
          <p className={styles.placeholder}>お絵描き機能は準備中です</p>
        </div>
      </div>
    </div>
  );
}
