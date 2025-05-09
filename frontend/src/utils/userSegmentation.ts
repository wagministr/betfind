import { supabase } from "./supabase";

// User domain categories for segmentation
export type UserDomain = 'gmail.com' | 'outlook.com' | 'yahoo.com' | 'hotmail.com' | 'other';

// Simple user segmentation by email domain
export const getUserDomain = (email: string | null): UserDomain => {
  if (!email) return 'other';
  
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (domain === 'gmail.com') return 'gmail.com';
  if (domain === 'outlook.com') return 'outlook.com';
  if (domain === 'yahoo.com') return 'yahoo.com';
  if (domain === 'hotmail.com') return 'hotmail.com';
  
  return 'other';
};

// Log user login for analytics
export const logUserLogin = async (userId: string, email: string) => {
  try {
    // You could log to Supabase here
    await supabase.from('user_logins').insert({
      user_id: userId,
      email: email,
      domain: getUserDomain(email),
      login_time: new Date().toISOString(),
    });
    
    console.log('User login logged successfully');
  } catch (error) {
    console.error('Failed to log user login:', error);
  }
};

// Get user metrics by domain (for demonstration)
export const getUserMetricsByDomain = async () => {
  try {
    // Using raw SQL to perform the group by operation
    const { data, error } = await supabase
      .rpc('get_user_metrics_by_domain');
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Failed to get user metrics:', error);
    return null;
  }
};

// Alternative approach using count queries per domain
export const getUserDomainCounts = async () => {
  const domains: UserDomain[] = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'other'];
  const results: Record<UserDomain, number> = { 'gmail.com': 0, 'outlook.com': 0, 'yahoo.com': 0, 'hotmail.com': 0, 'other': 0 };
  
  try {
    for (const domain of domains) {
      const { count, error } = await supabase
        .from('user_logins')
        .select('*', { count: 'exact', head: true })
        .eq('domain', domain);
        
      if (!error && count !== null) {
        results[domain] = count;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Failed to get domain counts:', error);
    return null;
  }
};

// This could be expanded with more sophisticated segmentation
// such as activity levels, engagement metrics, etc. 