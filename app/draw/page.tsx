"use client";

import { useUser } from "@/contexts/UserContext";
import UserSetup from "@/components/UserSetup";
import { usePresence } from "@/hooks/usePresence";
import PlazaHeader from "@/components/PlazaHeader";
import NotificationBar from "@/components/NotificationBar";
import ParticipantBar from "@/components/ParticipantBar";
import styles from "./draw.module.css";

export default function DrawPage() {
  const { user, isLoaded, saveUser } = useUser();
  const { participants, notifications, callEveryone, isCallOnCooldown } = usePresence();

  if (!isLoaded) return null;
  if (!user) return <UserSetup onEnter={(name, iconId) => saveUser(name, iconId)} />;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <PlazaHeader title="お絵描き広場" onCallEveryone={() => callEveryone("お絵描き広場")} isCallOnCooldown={isCallOnCooldown} />
        <NotificationBar notifications={notifications} />
        <ParticipantBar participants={participants} />

        <div className={styles.content}>
          <p className={styles.placeholder}>お絵描き機能は準備中です</p>
        </div>
      </div>
    </div>
  );
}
