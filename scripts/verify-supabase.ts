// Script to verify Supabase connection
// Run with: source .env.local && npx tsx scripts/verify-supabase.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Make sure .env.local has:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

console.log('🔄 Connecting to Supabase...')
console.log(`   URL: ${supabaseUrl}`)

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyConnection() {
  try {
    // Test basic connection by checking if profiles table exists
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('⚠️  Connection successful but tables not found!')
        console.log('   Run the migration SQL in Supabase Dashboard:')
        console.log('   https://supabase.com/dashboard/project/yhkbdadjreuibktginaf/sql/new')
        console.log('   Copy contents from: supabase/migrations/001_initial_schema.sql')
        return
      }
      throw error
    }

    console.log('✅ Supabase connection successful!')
    console.log('✅ Database tables are set up!')

    // Check all expected tables
    const tables = ['profiles', 'cases', 'chat_messages', 'documents', 'evidence', 'lawyer_profiles', 'lawyer_requests', 'payments', 'intake_sessions']

    console.log('\n📋 Checking tables...')
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('count').limit(1)
      if (tableError) {
        console.log(`   ❌ ${table}: ${tableError.message}`)
      } else {
        console.log(`   ✅ ${table}`)
      }
    }

    console.log('\n🎉 Supabase is fully configured!')

  } catch (err) {
    console.error('❌ Connection failed:', err)
    process.exit(1)
  }
}

verifyConnection()
