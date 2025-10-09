import { connectToDatabase } from '../connection';
import { Keyword, IKeyword } from '../models/Keyword';

/**
 * Track a keyword search
 */
export async function trackKeyword(keywordData: {
  keyword: string;
  username: string;
  ip: string;
}) {
  try {
    await connectToDatabase();
    
    // Create new keyword record
    const newKeyword = await Keyword.create({
      ...keywordData,
      timestamp: new Date(),
    });
    
    return newKeyword.toObject();
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
    await connectToDatabase();
    return await Keyword.find().sort({ timestamp: -1 }).select('-__v').lean();
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
    await connectToDatabase();
    return await Keyword.find({ username })
      .sort({ timestamp: -1 })
      .select('-__v')
      .lean();
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
    await connectToDatabase();
    return await Keyword.find({
      timestamp: { $gte: fromDate, $lte: toDate }
    })
      .sort({ timestamp: -1 })
      .select('-__v')
      .lean();
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
    await connectToDatabase();
    
    // Build query
    const query: any = {};
    
    if (filters.username) {
      query.username = filters.username;
    }
    
    if (filters.ip) {
      query.ip = filters.ip;
    }
    
    if (filters.keyword) {
      query.keyword = { $regex: filters.keyword, $options: 'i' };
    }
    
    if (filters.fromDate || filters.toDate) {
      query.timestamp = {};
      
      if (filters.fromDate) {
        query.timestamp.$gte = filters.fromDate;
      }
      
      if (filters.toDate) {
        query.timestamp.$lte = filters.toDate;
      }
    }
    
    return await Keyword.find(query)
      .sort({ timestamp: -1 })
      .select('-__v')
      .lean();
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
    await connectToDatabase();
    const result = await Keyword.deleteMany({ username });
    return { deletedCount: result.deletedCount };
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
    await connectToDatabase();
    const result = await Keyword.deleteMany({ timestamp: { $lt: date } });
    return { deletedCount: result.deletedCount };
  } catch (error) {
    console.error('Error deleting old keywords:', error);
    throw error;
  }
}