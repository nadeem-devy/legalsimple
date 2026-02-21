"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Plays a short notification chime using the Web Audio API.
 */
export function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Three-tone chime: C5 → E5 → G5
    const frequencies = [523.25, 659.25, 783.99];
    for (let i = 0; i < frequencies.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.value = frequencies[i];

      const start = now + i * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.start(start);
      osc.stop(start + 0.35);
    }
  } catch {
    // AudioContext not available — skip sound
  }
}

/**
 * Hook that polls for unread messages and returns:
 * - unreadCount: live unread count (null until first fetch)
 * - newMessageAlert: increments each time new messages are detected
 */
export function useMessageNotifications(pollIntervalMs = 5000) {
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [newMessageAlert, setNewMessageAlert] = useState(0);
  const prevCountRef = useRef<number>(0);
  const initializedRef = useRef(false);
  const hasInteractedRef = useRef(false);

  // Track user interaction for AudioContext (browsers require it)
  useEffect(() => {
    const markInteracted = () => {
      hasInteractedRef.current = true;
    };
    window.addEventListener("click", markInteracted, { once: true });
    window.addEventListener("keydown", markInteracted, { once: true });
    return () => {
      window.removeEventListener("click", markInteracted);
      window.removeEventListener("keydown", markInteracted);
    };
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/unread-count");
      if (!res.ok) return;
      const { count } = await res.json();
      setUnreadCount(count);

      // On first fetch, just store the baseline — don't notify
      if (!initializedRef.current) {
        prevCountRef.current = count;
        initializedRef.current = true;
        return;
      }

      // New messages arrived since last check
      if (count > prevCountRef.current) {
        // Play notification sound
        if (hasInteractedRef.current) {
          playNotificationSound();
        }

        // Signal new message to consuming component
        setNewMessageAlert((prev) => prev + 1);
      }

      prevCountRef.current = count;
    } catch {
      // Network error — skip
    }
  }, []);

  // Poll on interval
  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchUnread, pollIntervalMs]);

  return { unreadCount, newMessageAlert };
}
