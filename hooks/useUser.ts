"use client";

import { useState, useEffect } from "react";
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
}

const STORAGE_KEY = "himajin_user";

export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoaded(true);
  }, []);

  const saveUser = (name: string) => {
    const newUser: UserInfo = { name, uuid: uuidv4() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const clearUser = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return { user, isLoaded, saveUser, clearUser };
}
