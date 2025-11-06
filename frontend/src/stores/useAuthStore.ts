import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { toast } from "sonner";
import { create } from "zustand";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  clearState: () => {
    set({
      accessToken: null,
      user: null,
      loading: false,
    });
  },

  setAccessToken: (accessToken: string) => {
    set({ accessToken });
  },

  signUp: async (firstName, lastName, username, email, password) => {
    try {
      set({ loading: true });
      // goi api
      await authService.signUp(firstName, lastName, username, email, password);

      toast.success("Sign up success");
    } catch (error) {
      console.log(error);
      toast.error("Sign up failed");
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (username, password) => {
    try {
      set({ loading: true });

      const { accessToken } = await authService.signIn(username, password);

      get().setAccessToken(accessToken);

      await get().fetchMe();
      toast.success("Welcome back to DgChat");
    } catch (error) {
      console.log(error);
      toast.error("Sign in failed");
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      get().clearState();
      await authService.signOut();
      toast.success("Sign out success");
    } catch (error) {
      console.log(error);
      toast.error("Sign out failed");
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();

      set({ user });
    } catch (error) {
      console.log(error);
      set({ user: null, accessToken: null });
      toast.error("Fetch me failed");
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      set({ loading: true });
      const { user, fetchMe, setAccessToken } = get();
      const accessToken = await authService.refresh();

      setAccessToken(accessToken);

      if (!user) {
        await fetchMe();
      }
    } catch (error) {
      console.log(error);

      const { accessToken } = get();
      if (accessToken) {
        toast.error("Session expired, please sign in again");
      }
      get().clearState();
    } finally {
      set({ loading: false });
    }
  },
}));
