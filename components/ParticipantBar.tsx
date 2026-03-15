import Image from "next/image";
import type { Participant } from "@/hooks/usePresence";
import { getIconPath } from "@/lib/icons";
import styles from "./ParticipantBar.module.css";

interface Props {
  participants: Participant[];
}

export default function ParticipantBar({ participants }: Props) {
  return (
    <div className={styles.bar}>
      <span className={styles.label}>参加者:</span>
      {participants.map((p) => (
        <div key={p.uuid} className={styles.item}>
          <Image
            src={getIconPath(p.iconId)}
            alt={p.username}
            width={32}
            height={32}
            className={styles.icon}
          />
          <span className={styles.name}>{p.username}</span>
        </div>
      ))}
    </div>
  );
}
