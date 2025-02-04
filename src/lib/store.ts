import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import api from './api';

interface UserProfile {
  id: string;
  full_name: string;
  role: 'admin' | 'manager' | 'user';
  avatar_url?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

interface Settings {
  emailNotifications: boolean;
  language: 'fr' | 'en';
  compactMode: boolean;
  theme: {
    primaryColor: 'blue' | 'green' | 'purple' | 'red';
    fontSize: 'small' | 'medium' | 'large';
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
  };
}

interface AuthStore {
  user: User | null;
  profile: UserProfile | null;
  notifications: Notification[];
  settings: Settings;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  markAllNotificationsAsRead: () => void;
  updateSettings: (settings: Partial<Settings>) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

const defaultSettings: Settings = {
  emailNotifications: true,
  language: 'fr',
  compactMode: false,
  theme: {
    primaryColor: 'blue',
    fontSize: 'medium',
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
  },
  privacy: {
    showOnlineStatus: true,
    showLastSeen: true,
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      notifications: [],
      settings: defaultSettings,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: Math.random().toString(36).substr(2, 9),
              createdAt: new Date(),
            },
            ...state.notifications,
          ],
        })),
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      clearAllNotifications: () =>
        set({ notifications: [] }),
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
            theme: {
              ...state.settings.theme,
              ...(newSettings.theme || {}),
            },
            accessibility: {
              ...state.settings.accessibility,
              ...(newSettings.accessibility || {}),
            },
            privacy: {
              ...state.settings.privacy,
              ...(newSettings.privacy || {}),
            },
          },
        })),
      login: async (email: string, password: string) => {
        try {
          const data = await api.auth.login(email, password);
          const { token, user } = data;
          
          // Store token
          localStorage.setItem('token', token);
          
          // Set user
          set({ user });
          
          // Load profile
          await get().loadProfile();
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },
      logout: async () => {
        try {
          localStorage.removeItem('token');
          set({ user: null, profile: null });
        } catch (error) {
          console.error('Logout error:', error);
          throw error;
        }
      },
      loadProfile: async () => {
        try {
          const user = await api.auth.getCurrentUser();
          set({ profile: user });
        } catch (error) {
          console.error('Load profile error:', error);
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        isSidebarOpen: state.isSidebarOpen,
        settings: state.settings,
      }),
    }
  )
);