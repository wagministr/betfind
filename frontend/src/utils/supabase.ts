import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if environment variables are set
if (!supabaseUrl) {
  console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_URL is not set');
  // In browser environment, we don't want to crash the app
  if (typeof window === 'undefined') {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required but not set');
  }
}

if (!supabaseAnonKey) {
  console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  // In browser environment, we don't want to crash the app
  if (typeof window === 'undefined') {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required but not set');
  }
}

// For server-side scripts, we also need the service role key
if (typeof window === 'undefined' && !supabaseServiceKey) {
  console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is not set');
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations but not set');
}

// Create the appropriate Supabase client based on the environment
// For server-side (Node.js), use the service role key to bypass RLS
// For client-side (browser), use the anon key
export const supabase = typeof window === 'undefined'
  ? createClient(supabaseUrl, supabaseServiceKey) // Node.js - use service role
  : createClient(supabaseUrl, supabaseAnonKey);   // Browser - use anon key

console.log(`Supabase client created with ${typeof window === 'undefined' ? 'service role key' : 'anon key'}`);

// Test the connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    // Simple query to test the connection
    const { data, error } = await supabase
      .from('fixtures')
      .select('fixture_id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection test failed with exception:', err);
    return false;
  }
}