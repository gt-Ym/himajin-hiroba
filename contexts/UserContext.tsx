"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

const ADJECTIVES = [
  "おっとりした", "のんびりした", "ひょうきんな", "ふわふわの", "きらきらの",
  "どんくさい", "するどい", "おちゃめな", "むっつりした", "はつらつな",
  "しょんぼりした", "うきうきの", "のそのその", "ぼんやりした", "いそがしそうな",
  "なまけもの", "げんきな", "ねむそうな", "おだやかな", "あわてんぼうの",
];

const ANIMALS = [
  "ペンギン", "パンダ", "カピバラ", "ナマケモノ", "アルマジロ",
  "カモノハシ", "ハリネズミ", "アザラシ", "ラッコ", "コアラ",
  "フラミンゴ", "タヌキ", "キツネ", "シバイヌ", "トラ",
  "ゾウ", "キリン", "カバ", "サイ", "ビーバー",
];

export function generateRandomName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj}${animal}`;
}

export interface UserInfo {
  name: string;
  uuid: string;
  iconId: string;
}

const STORAGE_KEY = "himajin_user";

interface UserContextValue {
  user: UserInfo | null;
  isLoaded: boolean;
  saveUser: (name: string, iconId: string) => UserInfo;
  clearUser: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 旧データに iconId がない場合はデフォルト値を補完
      if (!parsed.iconId) parsed.iconId = "penguin";
      setUser(parsed);
    }
    setIsLoaded(true);
  }, []);

  const saveUser = (name: string, iconId: string) => {
    const newUser: UserInfo = { name, uuid: uuidv4(), iconId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const clearUser = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, isLoaded, saveUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
