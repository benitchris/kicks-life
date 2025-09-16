export function createClient() {
  // Mock server client for development without Supabase
  return {
    from: (table: string) => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => ({ data: null, error: null }),
      single: () => ({ data: null, error: null }),
      order: () => ({ data: [], error: null }),
    }),
    auth: {
      getUser: () => ({ data: { user: null }, error: null }),
    },
  }
}
