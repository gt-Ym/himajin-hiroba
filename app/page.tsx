"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import UserSetup from "@/components/UserSetup";

export default function Home() {
  const router = useRouter();
  const { user, isLoaded, saveUser } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      router.replace("/chat");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) return null;
  if (user) return null;

  return (
    <UserSetup
      onEnter={(name, iconId) => {
        saveUser(name, iconId);
        router.push("/chat");
      }}
    />
  );
}
