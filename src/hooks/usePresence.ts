"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PresenceStatus } from "@/types/messages";

interface UsePresenceOptions {
  userId: string | undefined;
  onStatusChange?: (status: PresenceStatus) => void;
}

export function usePresence({ userId, onStatusChange }: UsePresenceOptions) {
  const supabase = createClient();

  // Update presence on mount and visibility change
  useEffect(() => {
    if (!userId) return;

    const updatePresence = async (status: PresenceStatus) => {
      try {
        await fetch("/api/messages/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        onStatusChange?.(status);
      } catch (error) {
        console.error("Failed to update presence:", error);
      }
    };

    // Set online on mount
    updatePresence("online");

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updatePresence("online");
      } else {
        updatePresence("away");
      }
    };

    // Handle page unload - use beacon for reliable offline update
    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        "/api/messages/presence",
        JSON.stringify({ userId, status: "offline" })
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      if (document.visibilityState === "visible") {
        updatePresence("online");
      }
    }, 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(heartbeat);
      updatePresence("offline");
    };
  }, [userId, onStatusChange]);

  // Manual status update
  const setStatus = useCallback(
    async (status: PresenceStatus) => {
      if (!userId) return;

      try {
        await fetch("/api/messages/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        onStatusChange?.(status);
      } catch (error) {
        console.error("Failed to update presence:", error);
      }
    },
    [userId, onStatusChange]
  );

  return { setStatus };
}
