import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      convoLoading: false, // Convo loading
      messageLoading: false, // Message loading

      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () =>
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
          messageLoading: false,
        }),

      fetchConversations: async () => {
        try {
          set({ convoLoading: true });
          const { conversations } = await chatService.fetchConversations();

          set({ conversations, convoLoading: false });
        } catch (error) {
          console.log("Loi khi fetchConversations", error);
          set({ convoLoading: false });
        }
      },

      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState();

        const convoId = conversationId ?? activeConversationId;
        if (!convoId) return;

        const current = messages?.[convoId];
        const nextCursor = current?.nextCursor === undefined ? "" : current?.nextCursor;

        if (nextCursor === null) return; // Khong tai them neu da het

        set({ messageLoading: true });

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessages(convoId, nextCursor);

          const processed = fetched.map((msg) => ({
            ...msg,
            isOwn: (typeof msg.senderId === "string" ? msg.senderId : (msg.senderId as any)?._id) === user?._id,
          }));

          set((state) => {
            const prev = state.messages[convoId]?.items ?? [];
            const merged = prev.length > 0 ? [...prev, ...processed] : processed;

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (error) {
          console.log("Loi khi fetchMessages", error);
        } finally {
          set({ messageLoading: false });
        }
      },

      sendDirectMessage: async (recipientId, content, imgUrl) => {
        try {
          const { activeConversationId } = get();
          const { user } = useAuthStore.getState();
          const response = await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined
          );

          // Add message to local state immediately
          if (response) {
            await get().addMessage(response);

            // If new conversation, fetch conversations
            if (!activeConversationId) {
              await get().fetchConversations();
            } else if (user) {
              // Reset unread count for sender
              set((state) => ({
                conversations: state.conversations.map((c) =>
                  c._id === activeConversationId ? { ...c, unreadCounts: { ...c.unreadCounts, [user._id]: 0 } } : c
                ),
              }));
            }
          }
        } catch (error: any) {
          console.error("Loi khi sendDirectMessage", error);
          if (error?.response) {
            console.error("Response error:", error.response.data);
          }
        }
      },

      sendGroupMessage: async (conversationId, content, imgUrl) => {
        try {
          const { user } = useAuthStore.getState();
          const message = await chatService.sendGroupMessage(conversationId, content, imgUrl);

          // Add message to local state immediately
          if (message) {
            await get().addMessage(message);

            // Reset unread count for sender
            if (user) {
              set((state) => ({
                conversations: state.conversations.map((c) =>
                  c._id === conversationId ? { ...c, unreadCounts: { ...c.unreadCounts, [user._id]: 0 } } : c
                ),
              }));
            }
          }
        } catch (error: any) {
          console.error("Loi khi sendGroupMessage", error);
          if (error?.response) {
            console.error("Response error:", error.response.data);
          }
        }
      },

      addMessage: async (message) => {
        try {
          const { user } = useAuthStore.getState();
          const { fetchMessages } = get();

          const senderId = typeof message.senderId === "string" ? message.senderId : (message.senderId as any)?._id;
          message.isOwn = senderId === user?._id;

          const convoId = message.conversationId;

          let prevItems = get().messages[convoId]?.items ?? [];

          if (prevItems.length === 0) {
            await fetchMessages(message.conversationId);
            prevItems = get().messages[convoId]?.items ?? [];
          }

          set((state) => {
            const currentItems = state.messages[convoId]?.items ?? [];
            if (currentItems.some((m) => m._id === message._id)) {
              return state;
            }

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: [...currentItems, message],
                  hasMore: state.messages[convoId]?.hasMore ?? false,
                  nextCursor: state.messages[convoId]?.nextCursor ?? null,
                },
              },
            };
          });
        } catch (error) {
          console.log("Loi khi addMessage", error);
        }
      },

      updateConversation: async (conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) => (c._id === conversation._id ? { ...c, ...conversation } : c)),
        }));
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
);
