import { mockStudents, mockTeachers, mockUsers } from './mockData';

// Mock Supabase client
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (email === 'admin@example.com' && password === 'admin') {
        return {
          data: {
            user: {
              id: '123',
              email: 'admin@example.com',
              role: 'authenticated',
            },
          },
          error: null,
        };
      }
      return {
        data: { user: null },
        error: new Error('Invalid credentials'),
      };
    },
    getSession: async () => ({
      data: {
        session: {
          user: {
            id: '123',
            email: 'admin@example.com',
            role: 'authenticated',
          },
        },
      },
    }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signOut: async () => ({ error: null }),
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => {
          switch (table) {
            case 'profiles':
              return {
                data: mockUsers[0],
                error: null,
              };
            default:
              return { data: null, error: null };
          }
        },
        order: () => {
          switch (table) {
            case 'students':
              return { data: mockStudents, error: null };
            case 'teachers':
              return { data: mockTeachers, error: null };
            case 'profiles':
              return { data: mockUsers, error: null };
            default:
              return { data: [], error: null };
          }
        },
      }),
      order: () => {
        switch (table) {
          case 'students':
            return { data: mockStudents, error: null };
          case 'teachers':
            return { data: mockTeachers, error: null };
          case 'profiles':
            return { data: mockUsers, error: null };
          default:
            return { data: [], error: null };
        }
      },
    }),
    insert: async (data: any) => {
      console.log('Insert:', table, data);
      return { error: null };
    },
    update: async (data: any) => ({
      eq: async () => {
        console.log('Update:', table, data);
        return {
          error: null,
          select: async () => ({
            single: async () => ({ data, error: null }),
          }),
        };
      },
    }),
    delete: async () => ({
      eq: async () => {
        console.log('Delete:', table);
        return { error: null };
      },
    }),
  }),
};