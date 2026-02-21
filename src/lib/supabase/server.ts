import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'

// Demo user for mock mode
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@legalsimple.ai',
  user_metadata: { full_name: 'Demo User' },
}

const DEMO_PROFILE = {
  id: 'demo-user-123',
  email: 'demo@legalsimple.ai',
  full_name: 'Demo Admin',
  role: 'admin',
  state: 'AZ',
  phone: '(555) 123-4567',
  created_at: new Date().toISOString(),
}

// Demo cases for mock mode
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
    incident_date: '2024-01-15',
    incident_description: 'Filing for divorce after 5 years of marriage. Both parties have agreed to an uncontested divorce with fair division of assets.',
    damages_amount: null,
    desired_outcome: 'Fair division of assets and custody arrangement',
    complexity_score: 5,
    lawyer_recommended: false,
    ai_summary: 'Uncontested divorce case in Maricopa County, AZ. Client seeking dissolution of marriage with agreed terms.',
    urgency: 'normal',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'case-002',
    case_number: 'LS-2024-002',
    client_id: 'demo-user-123',
    status: 'document_ready',
    case_type: 'personal_injury',
    sub_type: 'car_accident',
    state: 'NV',
    county: 'Clark',
    city: 'Las Vegas',
    plaintiff_name: 'Demo User',
    defendant_name: 'ABC Insurance Co.',
    defendant_type: 'business',
    incident_date: '2024-02-20',
    incident_description: 'Rear-ended at a stoplight on Las Vegas Blvd. Suffered whiplash and back pain requiring physical therapy.',
    damages_amount: 15000,
    damages_description: 'Medical bills ($8,000), lost wages ($4,000), pain and suffering ($3,000)',
    desired_outcome: 'Full compensation for medical expenses and pain/suffering',
    complexity_score: 4,
    lawyer_recommended: false,
    ai_summary: 'Minor car accident personal injury claim in Clark County, NV. Clear liability, documented injuries.',
    urgency: 'normal',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'case-003',
    case_number: 'LS-2024-003',
    client_id: 'demo-user-123',
    status: 'lawyer_recommended',
    case_type: 'estate_planning',
    sub_type: 'will',
    state: 'TX',
    county: 'Harris',
    city: 'Houston',
    plaintiff_name: 'Demo User',
    defendant_name: null,
    defendant_type: null,
    incident_date: null,
    incident_description: 'Creating a comprehensive estate plan including will, trust, and power of attorney documents.',
    damages_amount: null,
    desired_outcome: 'Complete estate planning documents',
    complexity_score: 7,
    lawyer_recommended: true,
    ai_summary: 'Complex estate planning case with multiple beneficiaries and real estate holdings. Lawyer review recommended.',
    urgency: 'low',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const DEMO_MESSAGES = [
  {
    id: 'msg-001',
    case_id: 'case-001',
    sender_type: 'ai',
    content: 'Hello! I\'m here to help you with your legal matter. Can you tell me what type of legal issue you\'re facing?',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'msg-002',
    case_id: 'case-001',
    sender_type: 'user',
    sender_id: 'demo-user-123',
    content: 'I need help filing for divorce in Arizona.',
    created_at: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: 'msg-003',
    case_id: 'case-001',
    sender_type: 'ai',
    content: 'I understand you\'re looking to file for divorce in Arizona. I\'ll help guide you through this process. First, can you tell me which county you reside in?',
    created_at: new Date(Date.now() - 3400000).toISOString(),
  },
]

const DEMO_DOCUMENTS = [
  {
    id: 'doc-001',
    case_id: 'case-002',
    document_type: 'demand_letter',
    title: 'Demand Letter - Personal Injury Claim',
    content: 'Sample demand letter content for the car accident case...',
    status: 'draft',
    version: 1,
    generated_by: 'ai',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'doc-002',
    case_id: 'case-001',
    document_type: 'petition_for_divorce',
    title: 'Petition for Dissolution of Marriage',
    content: 'Sample divorce petition content...',
    status: 'draft',
    version: 1,
    generated_by: 'ai',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const DEMO_EVIDENCE: never[] = []

// Demo lawyers for marketplace
const DEMO_LAWYERS = [
  {
    id: 'lawyer-001',
    user_id: 'lawyer-user-001',
    bar_number: 'AZ-12345',
    bar_state: 'AZ',
    verified: true,
    practice_areas: ['family_law', 'estate_planning'],
    states_licensed: ['AZ', 'NV'],
    hourly_rate: 250,
    bio: 'Experienced family law attorney with 15 years of practice in Arizona. Specializing in divorce, custody disputes, and estate planning for families navigating complex transitions.',
    years_experience: 15,
    availability_status: 'available',
    rating: 4.8,
    total_cases: 234,
  },
  {
    id: 'lawyer-002',
    user_id: 'lawyer-user-002',
    bar_number: 'NV-67890',
    bar_state: 'NV',
    verified: true,
    practice_areas: ['personal_injury'],
    states_licensed: ['NV', 'AZ'],
    hourly_rate: 300,
    bio: 'Personal injury specialist with a track record of successful settlements. Recovered over $15M for clients in auto accidents, workplace injuries, and slip-and-fall cases.',
    years_experience: 10,
    availability_status: 'available',
    rating: 4.9,
    total_cases: 156,
  },
  {
    id: 'lawyer-003',
    user_id: 'lawyer-user-003',
    bar_number: 'AZ-54321',
    bar_state: 'AZ',
    verified: true,
    practice_areas: ['business_formation', 'estate_planning'],
    states_licensed: ['AZ', 'TX', 'NV'],
    hourly_rate: 350,
    bio: 'Business and corporate attorney helping entrepreneurs launch and protect their ventures. Expert in LLC formations, partnership agreements, and business succession planning.',
    years_experience: 20,
    availability_status: 'available',
    rating: 4.7,
    total_cases: 312,
  },
  {
    id: 'lawyer-004',
    user_id: 'lawyer-user-004',
    bar_number: 'TX-11223',
    bar_state: 'TX',
    verified: true,
    practice_areas: ['family_law'],
    states_licensed: ['TX'],
    hourly_rate: 200,
    bio: 'Compassionate family law attorney dedicated to protecting children and families. Handles divorce, child custody, adoption, and guardianship cases with care and expertise.',
    years_experience: 8,
    availability_status: 'available',
    rating: 4.9,
    total_cases: 189,
  },
  {
    id: 'lawyer-005',
    user_id: 'lawyer-user-005',
    bar_number: 'NV-44556',
    bar_state: 'NV',
    verified: true,
    practice_areas: ['personal_injury', 'family_law'],
    states_licensed: ['NV'],
    hourly_rate: 275,
    bio: 'Dual-practice attorney offering personalized legal services in both personal injury and family law. Known for aggressive negotiation and compassionate client advocacy.',
    years_experience: 12,
    availability_status: 'busy',
    rating: 4.6,
    total_cases: 203,
  },
  {
    id: 'lawyer-006',
    user_id: 'lawyer-user-006',
    bar_number: 'AZ-77889',
    bar_state: 'AZ',
    verified: true,
    practice_areas: ['estate_planning'],
    states_licensed: ['AZ'],
    hourly_rate: 225,
    bio: 'Estate planning specialist focused on wills, trusts, and probate matters. Helps families secure their legacy with comprehensive estate strategies tailored to Arizona law.',
    years_experience: 18,
    availability_status: 'available',
    rating: 4.8,
    total_cases: 445,
  },
  {
    id: 'lawyer-007',
    user_id: 'lawyer-user-007',
    bar_number: 'TX-99001',
    bar_state: 'TX',
    verified: true,
    practice_areas: ['business_formation', 'personal_injury'],
    states_licensed: ['TX', 'AZ'],
    hourly_rate: 325,
    bio: 'Versatile attorney with expertise in business litigation and personal injury. Former Fortune 500 in-house counsel now serving individuals and small businesses across Texas and Arizona.',
    years_experience: 22,
    availability_status: 'available',
    rating: 4.5,
    total_cases: 278,
  },
  {
    id: 'lawyer-008',
    user_id: 'lawyer-user-008',
    bar_number: 'AZ-33445',
    bar_state: 'AZ',
    verified: true,
    practice_areas: ['family_law', 'personal_injury', 'estate_planning'],
    states_licensed: ['AZ', 'NV', 'TX'],
    hourly_rate: 400,
    bio: 'Senior partner with 25+ years of multi-disciplinary practice. Licensed in three states with a reputation for excellence in complex family, injury, and estate matters.',
    years_experience: 25,
    availability_status: 'available',
    rating: 5.0,
    total_cases: 587,
  },
]

// Demo lawyer requests
const DEMO_LAWYER_REQUESTS = [
  {
    id: 'req-001',
    case_id: 'case-001',
    lawyer_id: 'lawyer-001',
    status: 'pending',
    client_message: 'Need help with divorce paperwork review.',
    created_at: new Date().toISOString(),
  },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMockQueryBuilder(table: string, initialData: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filteredData = [...initialData] as any[]

  const builder = {
    select: (columns?: string) => {
      // Handle join queries like "*, cases!inner(client_id)"
      if (columns?.includes('!inner')) {
        // For document queries with case join, just return documents
        if (table === 'documents') {
          filteredData = DEMO_DOCUMENTS
        }
      }
      return builder
    },
    eq: (column: string, value: unknown) => {
      if (column === 'client_id' || column === 'cases.client_id') {
        filteredData = filteredData.filter(item => item.client_id === value || true) // Return all in mock
      } else {
        filteredData = filteredData.filter(item => item[column] === value)
      }
      return builder
    },
    neq: (column: string, value: string) => {
      filteredData = filteredData.filter(item => item[column] !== value)
      return builder
    },
    not: (column: string, operator: string, value: string) => {
      // Handle "not in" queries
      if (operator === 'in') {
        const values = value.replace(/[()'"]/g, '').split(',').map(v => v.trim())
        filteredData = filteredData.filter(item => !values.includes(item[column]))
      }
      return builder
    },
    in: (column: string, values: string[]) => {
      filteredData = filteredData.filter(item => values.includes(item[column]))
      return builder
    },
    contains: (column: string, value: string[]) => {
      // For array contains queries
      return builder
    },
    order: (column: string, opts?: { ascending: boolean }) => {
      const asc = opts?.ascending ?? true
      filteredData.sort((a, b) => {
        if (asc) return a[column] > b[column] ? 1 : -1
        return a[column] < b[column] ? 1 : -1
      })
      return builder
    },
    limit: (count: number) => {
      filteredData = filteredData.slice(0, count)
      return builder
    },
    single: async () => {
      return { data: filteredData[0] || null, error: filteredData[0] ? null : { message: 'Not found' } }
    },
    then: async (resolve: (result: { data: unknown[]; error: null }) => void) => {
      resolve({ data: filteredData, error: null })
    },
    // Make it thenable for async/await
    [Symbol.toStringTag]: 'Promise',
  }

  // Add promise-like behavior
  Object.defineProperty(builder, 'data', { get: () => filteredData })
  Object.defineProperty(builder, 'error', { get: () => null })

  return builder
}

// Mock server client for development without Supabase
function createMockClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: DEMO_USER }, error: null }),
      getSession: async () => ({ data: { session: { user: DEMO_USER } }, error: null }),
    },
    from: (table: string) => {
      let data: unknown[] = []

      switch (table) {
        case 'profiles':
          data = [
            DEMO_PROFILE,
            {
              id: 'lawyer-user-001',
              email: 'sarah.johnson@legalsimple.ai',
              full_name: 'Sarah Johnson',
              role: 'lawyer',
              state: 'AZ',
              phone: '(602) 555-0101',
              created_at: new Date().toISOString(),
            },
            {
              id: 'lawyer-user-002',
              email: 'michael.chen@legalsimple.ai',
              full_name: 'Michael Chen',
              role: 'lawyer',
              state: 'NV',
              phone: '(702) 555-0202',
              created_at: new Date().toISOString(),
            },
            {
              id: 'lawyer-user-003',
              email: 'robert.martinez@legalsimple.ai',
              full_name: 'Robert Martinez',
              role: 'lawyer',
              state: 'AZ',
              phone: '(480) 555-0303',
              created_at: new Date().toISOString(),
            },
            {
              id: 'lawyer-user-004',
              email: 'emily.davis@legalsimple.ai',
              full_name: 'Emily Davis',
              role: 'lawyer',
              state: 'TX',
              phone: '(713) 555-0404',
              created_at: new Date().toISOString(),
            },
            {
              id: 'lawyer-user-005',
              email: 'james.wilson@legalsimple.ai',
              full_name: 'James Wilson',
              role: 'lawyer',
              state: 'NV',
              phone: '(702) 555-0505',
              created_at: new Date().toISOString(),
            },
            {
              id: 'lawyer-user-006',
              email: 'patricia.thompson@legalsimple.ai',
              full_name: 'Patricia Thompson',
              role: 'lawyer',
              state: 'AZ',
              phone: '(602) 555-0606',
              created_at: new Date().toISOString(),
            },
            {
              id: 'lawyer-user-007',
              email: 'david.garcia@legalsimple.ai',
              full_name: 'David Garcia',
              role: 'lawyer',
              state: 'TX',
              phone: '(512) 555-0707',
              created_at: new Date().toISOString(),
            },
            {
              id: 'lawyer-user-008',
              email: 'jennifer.anderson@legalsimple.ai',
              full_name: 'Jennifer Anderson',
              role: 'lawyer',
              state: 'AZ',
              phone: '(480) 555-0808',
              created_at: new Date().toISOString(),
            },
          ]
          break
        case 'cases':
          data = DEMO_CASES
          break
        case 'chat_messages':
          data = DEMO_MESSAGES
          break
        case 'documents':
          data = DEMO_DOCUMENTS
          break
        case 'evidence':
          data = DEMO_EVIDENCE
          break
        case 'lawyer_profiles':
          data = DEMO_LAWYERS
          break
        case 'lawyer_requests':
          data = DEMO_LAWYER_REQUESTS
          break
        default:
          data = []
      }

      const queryBuilder = createMockQueryBuilder(table, data)

      return {
        ...queryBuilder,
        insert: (insertData: Record<string, unknown>) => ({
          select: () => ({
            single: async () => ({ data: { id: 'new-' + Date.now(), ...insertData }, error: null }),
          }),
        }),
        update: (updateData: Record<string, unknown>) => ({
          eq: (column: string, value: string) => ({
            select: () => ({
              single: async () => ({ data: { id: value, ...updateData }, error: null }),
            }),
          }),
        }),
        upsert: (upsertData: Record<string, unknown>, options?: { onConflict?: string }) => ({
          select: () => ({
            single: async () => ({ data: { id: upsertData.id || 'new-' + Date.now(), ...upsertData }, error: null }),
          }),
        }),
        delete: () => ({
          eq: async () => ({ error: null }),
        }),
      }
    },
  }
}

export async function createClient() {
  if (MOCK_MODE) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createMockClient() as any
  }

  const cookieStore = await cookies()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}

export async function createAdminClient() {
  if (MOCK_MODE) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createMockClient() as any
  }

  // Use plain supabase-js client with service role key (no cookie-based JWT)
  // so that RLS is truly bypassed for admin operations
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const isMockMode = () => MOCK_MODE
