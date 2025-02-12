import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      if (res && res.data) {
        set({ authUser: res.data });
        toast.success("Logged in successfully");
        get().connectSocket();
      } else {
        toast.error("Invalid response from server.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "An error occurred during login.");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
  set({ isUpdatingProfile: true });
  try {
    const res = await axiosInstance.put("/auth/update-profile", data);

    console.log("Updated Profile Response:", res.data); // Debugging

    // Extract the user object and update state
    if (res.data && res.data.user) {
      set((state) => ({ authUser: { ...state.authUser, ...res.data.user } }));
    } else {
      throw new Error("Invalid response structure");
    }

    toast.success("Profile updated successfully");
  } catch (error) {
    console.error("Error in update profile:", error);
    toast.error(error.response?.data?.message || "An error occurred while updating profile.");
  } finally {
    set({ isUpdatingProfile: false });
  }
},

  handleRemoveImage: async () => {
  setIsSubmitting(true);

  try {
    const res = await updateProfile({ profilePic: null });

    if (res && res.user) {
      setSelectedImg(null);
      useAuthStore.setState((state) => ({
        authUser: { ...state.authUser, ...res.user },
      }));
    }

    console.log("Profile image removed successfully.");
  } catch (error) {
    console.error("Error removing profile image:", error);
    alert("Failed to remove profile image. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
},

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
