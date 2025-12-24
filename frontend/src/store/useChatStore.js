import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedChat: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // ===== USERS =====
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // ===== GROUPS =====
  getGroups: async () => {
    // Note: User loading flag might conflict if both called same time, generally ok
    try {
      const res = await axiosInstance.get("/groups/grps"); // Verify backend route matches this
      set({
        groups: Array.isArray(res.data) ? res.data : res.data.groups || [],
      });
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error(error.response?.data?.message || "Failed to fetch groups");
    }
  },

  // ===== MESSAGES =====
  getMessages: async (id, type = "private") => {
    set({ isMessagesLoading: true, messages: [] }); // Clear old messages first
    try {
      const url =
        type === "private" ? `/messages/${id}` : `/groups/${id}/messages`;
      
      const res = await axiosInstance.get(url);
      set({
        messages: Array.isArray(res.data) ? res.data : res.data.messages || [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedChat, messages } = get();
    if (!selectedChat) return;
    try {
      const url =
        selectedChat.type === "private"
          ? `/messages/send/${selectedChat.data._id}`
          : `/groups/${selectedChat.data._id}/send`;
          
      const res = await axiosInstance.post(url, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  // ===== SOCKET SUBSCRIBE =====
  subscribeToMessages: () => {
    const { selectedChat } = get();
    const socket = useAuthStore.getState().socket;

    if (!selectedChat || !socket) return;

    // Clean up previous listeners first to avoid duplicates
    socket.off("newMessage");
    socket.off("newGroupMessage");

    if (selectedChat.type === "private") {
      socket.on("newMessage", (newMessage) => {
        if (newMessage.senderId !== selectedChat.data._id) return;
        set((state) => ({ messages: [...state.messages, newMessage] }));
      });
    } else {
      socket.on("newGroupMessage", (newMessage) => {
        if (newMessage.groupId !== selectedChat.data._id) return;
        set((state) => ({ messages: [...state.messages, newMessage] }));
      });
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("newGroupMessage");
  },

  setSelectedChat: (chat) => {
    set({ selectedChat: chat }); // Just set the chat, getMessages will handle loading state
  },
}));