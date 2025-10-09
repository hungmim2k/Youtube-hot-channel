import { supabase, supabaseAdmin, TABLES, KeywordRecord } from '../supabase';

/**
 * Track a keyword search
 */
export async function trackKeyword(keywordData: {
  keyword: string;
  username: string;
  ip: string;
}) {
  try {
    // Create new keyword record
    const newKeyword = {
      keyword: keywordData.keyword,
      username: keywordData.username,
      ip: keywordData.ip,
      timestamp: new Date().toISOString(),
    };
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.KEYWORDS)
      .insert(newKeyword)
      .select()
      .single();
    
    if (error) {
      console.error('Error tracking keyword:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error tracking keyword:', error);
    throw error;
  }
}

/**
 * Get all keywords
 */
export async function getAllKeywords() {
  try {
    const { data, error } = await supabase
      .from(TABLES.KEYWORDS)
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error getting all keywords:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting all keywords:', error);
    throw error;
  }
}

/**
 * Get keywords by username
 */
export async function getKeywordsByUsername(username: string) {
  try {
    const { data, error } = await supabase
      .from(TABLES.KEYWORDS)
      .select('*')
      .eq('username', username)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error(`Error getting keywords for user ${username}:`, error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error getting keywords for user ${username}:`, error);
    throw error;
  }
}

/**
 * Get keywords by date range
 */
export async function getKeywordsByDateRange(fromDate: Date, toDate: Date) {
  try {
    const { data, error } = await supabase
      .from(TABLES.KEYWORDS)
      .select('*')
      .gte('timestamp', fromDate.toISOString())
      .lte('timestamp', toDate.toISOString())
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error getting keywords by date range:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting keywords by date range:', error);
    throw error;
  }
}

/**
 * Get keywords with filters
 */
export async function getKeywordsWithFilters(filters: {
  username?: string;
  fromDate?: Date;
  toDate?: Date;
  ip?: string;
  keyword?: string;
}) {
  try {
    // Start with a base query
    let query = supabase
      .from(TABLES.KEYWORDS)
      .select('*');
    
    // Apply filters
    if (filters.username) {
      query = query.eq('username', filters.username);
    }
    
    if (filters.ip) {
      query = query.eq('ip', filters.ip);
    }
    
    if (filters.keyword) {
      query = query.ilike('keyword', `%${filters.keyword}%`);
    }
    
    if (filters.fromDate) {
      query = query.gte('timestamp', filters.fromDate.toISOString());
    }
    
    if (filters.toDate) {
      query = query.lte('timestamp', filters.toDate.toISOString());
    }
    
    // Execute the query
    const { data, error } = await query.order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error getting keywords with filters:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting keywords with filters:', error);
    throw error;
  }
}

/**
 * Delete keywords by username
 */
export async function deleteKeywordsByUsername(username: string) {
  try {
    const { error, count } = await supabaseAdmin
      .from(TABLES.KEYWORDS)
      .delete({ count: 'exact' })
      .eq('username', username);
    
    if (error) {
      console.error(`Error deleting keywords for user ${username}:`, error);
      throw error;
    }
    
    return { deletedCount: count || 0 };
  } catch (error) {
    console.error(`Error deleting keywords for user ${username}:`, error);
    throw error;
  }
}

/**
 * Delete keywords older than a certain date
 */
export async function deleteKeywordsOlderThan(date: Date) {
  try {
    const { error, count } = await supabaseAdmin
      .from(TABLES.KEYWORDS)
      .delete({ count: 'exact' })
      .lt('timestamp', date.toISOString());
    
    if (error) {
      console.error('Error deleting old keywords:', error);
      throw error;
    }
    
    return { deletedCount: count || 0 };
  } catch (error) {
    console.error('Error deleting old keywords:', error);
    throw error;
  }
}