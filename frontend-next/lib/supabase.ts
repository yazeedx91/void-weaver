/**
 * Supabase Data Service
 * Real-time queries for Founder Dashboard
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getFounderMetrics() {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get completed assessments
    const { count: completedAssessments } = await supabase
      .from('assessment_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('session_status', 'completed');

    // Get last 24h new users
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday);

    // Get sanctuary access count
    const { count: sanctuaryAccess } = await supabase
      .from('restoration_sessions')
      .select('*', { count: 'exact', head: true });

    // Calculate SAR value
    const sarValue = (totalUsers || 0) * 5500;

    return {
      totalUsers: totalUsers || 0,
      completedAssessments: completedAssessments || 0,
      newUsers: newUsers || 0,
      sanctuaryAccess: sanctuaryAccess || 0,
      sarValue,
    };
  } catch (error) {
    console.error('Error fetching founder metrics:', error);
    return {
      totalUsers: 0,
      completedAssessments: 0,
      newUsers: 0,
      sanctuaryAccess: 0,
      sarValue: 0,
    };
  }
}

export async function logFounderEvent(eventType: string, metadata: any = {}) {
  try {
    await supabase
      .from('founder_analytics')
      .insert({
        event_type: eventType,
        event_metadata: metadata,
      });
  } catch (error) {
    console.error('Error logging event:', error);
  }
}
