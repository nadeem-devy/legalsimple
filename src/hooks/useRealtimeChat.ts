"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient, isMockMode } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { DecryptedMessage, PresenceStatus } from "@/types/messages";

interface PresenceState {
  user_id: string;
  status: PresenceStatus;
  is_typing: boolean;
}

interface UseRealtimeChatOptions {
  conversationId: string;
  userId: string;
  onNewMessage?: (message: DecryptedMessage) => void;
  onTypingChange?: (typingUsers: string[]) => void;
  onPresenceChange?: (presence: PresenceState[]) => void;
  onReadReceipt?: (messageId: string, userId: string) => void;
}

export function useRealtimeChat({
  conversationId,
  userId,
  onNewMessage,
  onTypingChange,
  onPresenceChange,
  onReadReceipt,
}: UseRealtimeChatOptions) {
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);

  // Check if we're in mock mode - skip real-time features
  const mockMode = isMockMode();

  // Setup message subscription
  useEffect(() => {
    // Skip real-time in mock mode
    if (mockMode || !conversationId) {
      setIsConnected(true); // Pretend connected in mock mode
      return;
    }

    if (!supabase?.channel) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (payload: any) => {
          // Only notify for messages from others
          if (payload.new.sender_id !== userId) {
            // Fetch the decrypted message from API
            try {
              const response = await fetch(
                `/api/messages/conversations/${conversationId}/messages?limit=1`
              );
              const data = await response.json();
              if (data.messages?.length) {
                onNewMessage?.(data.messages[data.messages.length - 1]);
              }
            } catch (error) {
              console.error("Failed to fetch new message:", error);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message_read_receipts",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          onReadReceipt?.(payload.new.message_id, payload.new.user_id);
        }
      )
      .subscribe((status: string) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, userId, supabase, onNewMessage, onReadReceipt]);

  // Setup presence channel for typing indicators
  useEffect(() => {
    // Skip real-time in mock mode
    if (mockMode || !conversationId) return;

    if (!supabase?.channel) return;

    const presenceChannel = supabase
      .channel(`presence:${conversationId}`)
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const users: PresenceState[] = [];
        const typing: string[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Object.values(state) as any[][]).forEach((presences) => {
          presences.forEach((presence: any) => {
            users.push({
              user_id: presence.user_id,
              status: presence.status || "online",
              is_typing: presence.is_typing || false,
            });

            if (presence.is_typing && presence.user_id !== userId) {
              typing.push(presence.user_id);
            }
          });
        });

        setOnlineUsers(users);
        setTypingUsers(typing);
        onPresenceChange?.(users);
        onTypingChange?.(typing);
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            user_id: userId,
            status: "online",
            is_typing: false,
            online_at: new Date().toISOString(),
          });
        }
      });

    presenceChannelRef.current = presenceChannel;

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [conversationId, userId, supabase, onTypingChange, onPresenceChange]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(async () => {
    if (mockMode || !presenceChannelRef.current) return;

    await presenceChannelRef.current.track({
      user_id: userId,
      status: "online",
      is_typing: true,
      online_at: new Date().toISOString(),
    });

    // Clear typing after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      if (presenceChannelRef.current) {
        await presenceChannelRef.current.track({
          user_id: userId,
          status: "online",
          is_typing: false,
          online_at: new Date().toISOString(),
        });
      }
    }, 3000);
  }, [userId, mockMode]);

  // Clear typing indicator
  const clearTypingIndicator = useCallback(async () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (mockMode || !presenceChannelRef.current) return;

    await presenceChannelRef.current.track({
      user_id: userId,
      status: "online",
      is_typing: false,
      online_at: new Date().toISOString(),
    });
  }, [userId, mockMode]);

  // Update presence status
  const updatePresence = useCallback(
    async (status: PresenceStatus) => {
      if (!mockMode && presenceChannelRef.current) {
        await presenceChannelRef.current.track({
          user_id: userId,
          status,
          is_typing: false,
          online_at: new Date().toISOString(),
        });
      }

      // Also update in database for persistence
      try {
        await fetch("/api/messages/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            current_conversation_id: conversationId,
          }),
        });
      } catch (error) {
        console.error("Failed to update presence:", error);
      }
    },
    [userId, conversationId, mockMode]
  );

  return {
    isConnected,
    typingUsers,
    onlineUsers,
    sendTypingIndicator,
    clearTypingIndicator,
    updatePresence,
  };
}
