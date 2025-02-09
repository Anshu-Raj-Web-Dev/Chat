import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  friends: [], 
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },


  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

 subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
  
    socket.on("newMessage", (newMessage) => {
      set((state) => ({ messages: [...state.messages, newMessage] }));
    });
  
    socket.on("messageUpdated", (updatedMessage) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // Add functions for delete, edit, and copy
  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((message) => message._id !== messageId),
      }));
      toast.success("Message deleted successfully.");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateMessage: async (message) => {
    try {
      const res = await axiosInstance.put(`/messages/update/${message._id}`, { text: message.text });
      
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === message._id ? { ...msg, text: res.data.text, isEdited: true } : msg
        ),
      }));
  
      const socket = useAuthStore.getState().socket;
      socket.emit("updateMessage", res.data); // Emit update to other users
  
      toast.success("Message updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update message");
    }
  },
  

  copyMessage: (messageText) => {
    navigator.clipboard.writeText(messageText);
    toast.success("Message copied to clipboard.");
  }
}));
