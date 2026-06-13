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
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/groups/grps");
      set({
        groups: Array.isArray(res.data) ? res.data : res.data.groups || [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },


  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);

      set((state) => ({
        groups: [...state.groups, res.data],
      }));

      toast.success("Group created");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || error.message);
    }
  },

  addMember: async (groupId, userId) => {
    try {
      const res = await axiosInstance.post("/groups/add-member", {
        groupId,
        userId,
      });

      toast.success("Member added");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    }
  },

  kickMember: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.post("/groups/kick", {
        groupId,
        memberId,
      });

      toast.success("Member removed");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);

      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedChat:
          state.selectedChat?.data?._id === groupId
            ? null
            : state.selectedChat,
      }));

      toast.success("Group deleted");
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    }
  },


  leaveGroup: async (groupId) => {
  try {
    await axiosInstance.post("/groups/leave", {
      groupId,
    });

    toast.success("Left group");
  } catch (error) {
    toast.error(
      error.response?.data?.error
    );
  }
},

  // ===== MESSAGES =====
  getMessages: async (id, type = "private") => {
    set({ isMessagesLoading: true });
    try {
      const url =
        type === "private" ? `/messages/${id}` : `/groups/${id}/messages`;
      const res = await axiosInstance.get(url);
      set({
        messages: Array.isArray(res.data) ? res.data : res.data.messages || [],
      });
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

  // ===== SOCKET SUBSCRIBE =====
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    // CLEAN OLD LISTENERS
    socket.off("newMessage");
    socket.off("newGroupMessage");

    // PRIVATE CHAT
    socket.on("newMessage", (newMessage) => {
      const selectedChat = get().selectedChat;

      if (!selectedChat) return;
      if (selectedChat.type !== "private") return;

      const myId = useAuthStore.getState().authUser?._id;

      const isRelevant =
        newMessage.senderId === selectedChat.data._id ||
        newMessage.receiverId === selectedChat.data._id ||
        newMessage.senderId === myId ||
        newMessage.receiverId === myId;

      if (!isRelevant) return;

      set((state) => {
        const exists = state.messages.some(
          (m) => m._id === newMessage._id
        );

        if (exists) return state;

        return {
          messages: [...state.messages, newMessage],
        };
      });
    });

    // GROUP CHAT
    socket.on("newGroupMessage", (newMessage) => {
      const selectedChat = get().selectedChat;

      if (!selectedChat) return;
      if (selectedChat.type !== "group") return;

      if (newMessage.groupId !== selectedChat.data._id) return;

      set((state) => {
        const exists = state.messages.some(
          (m) => m._id === newMessage._id
        );

        if (exists) return state;

        return {
          messages: [...state.messages, newMessage],
        };
      });
    });
  },
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("newGroupMessage");
  },

  setSelectedChat: (chat) =>
    set({
      selectedChat: chat,
      messages: [],
    }),
}));
