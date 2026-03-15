"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import { getIconPath } from "@/lib/icons";
import styles from "./Header.module.css";

export default function Header() {
  const { user, isLoaded, clearUser } = useUser();

  return (
    <header className={styles.header}>
      <Link href="/chat" className={styles.title}>
        暇人広場
      </Link>
      {isLoaded && user && (
        <div className={styles.userRow}>
          <Image
            src={getIconPath(user.iconId)}
            alt={user.iconId}
            width={28}
            height={28}
            className={styles.userIcon}
          />
          <span className={styles.username}>{user.name} さん</span>
          <button className={styles.changeLink} onClick={clearUser}>
            名前変更
          </button>
        </div>
      )}
    </header>
  );
}
