import { ANIMATION_DURATION } from "@/hooks/usePresence";
import type { Notification } from "@/hooks/usePresence";
import styles from "./NotificationBar.module.css";

interface Props {
  notifications: Notification[];
}

export default function NotificationBar({ notifications }: Props) {
  return (
    <div className={styles.bar}>
      {notifications.map((n) => (
        <span
          key={n.id}
          className={styles.item}
          style={{ animationDuration: `${ANIMATION_DURATION}ms` }}
        >
          {n.message}
        </span>
      ))}
    </div>
  );
}
