// Existing types...

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: 'admin' | 'manager' | 'user';
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  office_location?: string;
  bio?: string;
  avatar_url?: string;
  preferences: {
    notifications: {
      email: boolean;
      browser: boolean;
      mobile: boolean;
    };
    theme: {
      mode: 'light' | 'dark' | 'system';
      primaryColor: 'blue' | 'green' | 'purple' | 'red';
      fontSize: 'small' | 'medium' | 'large';
    };
    accessibility: {
      highContrast: boolean;
      reducedMotion: boolean;
      screenReader: boolean;
    };
    privacy: {
      showOnlineStatus: boolean;
      showLastSeen: boolean;
      showEmail: boolean;
      showPhone: boolean;
    };
    language: 'fr' | 'en';
    timezone: string;
  };
  last_seen?: string;
  created_at: string;
  updated_at: string;
}