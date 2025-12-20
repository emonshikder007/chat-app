import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedChat: null, // type: "private" | "group", data: {}
  isUsersLoading: false,
  isMessagesLoading: false,
  isGroupsLoading: false,

  // ====== USERS ======
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

  // ====== GROUPS ======
  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups", groupData);
      set({ groups: [...get().groups, res.data] });
      toast.success("Group created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  addMember: async (groupId, userId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/add`, { userId });
      const updatedGroups = get().groups.map((g) =>
        g._id === groupId ? res.data : g
      );
      set({ groups: updatedGroups });
      toast.success("Member added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  kickMember: async (groupId, userId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/kick`, { userId });
      const updatedGroups = get().groups.map((g) =>
        g._id === groupId ? res.data : g
      );
      set({ groups: updatedGroups });
      toast.success("Member kicked successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      const updatedGroups = get().groups.filter((g) => g._id !== groupId);
      set({ groups: updatedGroups });
      toast.success("Group deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  // ====== MESSAGES ======
  getMessages: async (id, type = "private") => {
    set({ isMessagesLoading: true });
    try {
      const url =
        type === "private" ? `/messages/${id}` : `/groups/${id}/messages`;
      const res = await axiosInstance.get(url);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
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

  subscribeToMessages: () => {
    const { selectedChat } = get();
    if (!selectedChat) return;

    const socket = useAuthStore.getState().socket;

    if (selectedChat.type === "private") {
      socket.on("newMessage", (newMessage) => {
        if (newMessage.senderId !== selectedChat.data._id) return;
        set({ messages: [...get().messages, newMessage] });
      });
    } else {
      socket.on("newGroupMessage", (newMessage) => {
        if (newMessage.groupId !== selectedChat.data._id) return;
        set({ messages: [...get().messages, newMessage] });
      });
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("newGroupMessage");
  },

  setSelectedChat: (chat) => set({ selectedChat: chat }),
}));
