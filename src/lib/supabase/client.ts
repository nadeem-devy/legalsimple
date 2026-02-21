import { createBrowserClient } from '@supabase/ssr'

const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'

// Demo user for mock mode
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@legalsimple.ai',
  user_metadata: { full_name: 'Demo User' },
}

// Demo cases for the mock client
const DEMO_CASES = [
  {
    id: 'case-001',
    case_number: 'LS-2024-001',
    client_id: 'demo-user-123',
    status: 'intake',
    case_type: 'family_law',
    sub_type: 'divorce',
    state: 'AZ',
    county: 'Maricopa',
    city: 'Phoenix',
    plaintiff_name: 'Demo User',
    defendant_name: 'Jane Doe',
    defendant_type: 'individual',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock client for development without Supabase
const mockClient = {
  auth: {
    getUser: async () => ({ data: { user: DEMO_USER }, error: null }),
    getSession: async () => ({ data: { session: { user: DEMO_USER } }, error: null }),
    signInWithPassword: async () => ({
      data: { user: DEMO_USER, session: { user: DEMO_USER } },
      error: null
    }),
    signUp: async () => ({
      data: { user: DEMO_USER, session: { user: DEMO_USER } },
      error: null
    }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
      // Immediately call with mock session
      setTimeout(() => callback('SIGNED_IN', { user: DEMO_USER }), 0)
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
  },
  from: (table: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any[] = []

    if (table === 'cases') {
      data = [...DEMO_CASES]
    }

    return {
      select: (columns?: string) => ({
        eq: (column: string, value: string) => ({
          single: async () => {
            const item = data.find(d => d[column] === value)
            return { data: item || null, error: item ? null : { message: 'Not found' } }
          },
          order: (col: string, opts?: { ascending: boolean }) => ({
            data: data.filter(d => d[column] === value),
            error: null,
          }),
        }),
        order: (column: string, opts?: { ascending: boolean }) => ({
          data: data,
          error: null,
        }),
      }),
      insert: (insertData: Record<string, unknown>) => ({
        select: () => ({
          single: async () => {
            const newId = 'new-case-' + Date.now()
            const caseNumber = 'LS-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
            const newItem = {
              id: newId,
              case_number: caseNumber,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...insertData,
            }
            // Add to mock data
            if (table === 'cases') {
              DEMO_CASES.push(newItem as typeof DEMO_CASES[0])
            }
            return { data: newItem, error: null }
          },
        }),
      }),
      update: (updateData: Record<string, unknown>) => ({
        eq: (column: string, value: string) => ({
          select: () => ({
            single: async () => {
              const item = data.find(d => d[column] === value)
              if (item) {
                Object.assign(item, updateData)
              }
              return { data: item ? { ...item, ...updateData } : null, error: null }
            },
          }),
        }),
      }),
      delete: () => ({
        eq: async () => ({ error: null }),
      }),
    }
  },
}

export function createClient() {
  if (MOCK_MODE) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mockClient as any
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const isMockMode = () => MOCK_MODE
