import mongoose, { Document, Schema } from 'mongoose';

// Define the Keyword interface
export interface IKeyword extends Document {
  keyword: string;
  username: string;
  ip: string;
  timestamp: Date;
}

// Create the Keyword schema
const KeywordSchema = new Schema<IKeyword>({
  keyword: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  ip: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for efficient queries
KeywordSchema.index({ keyword: 1 });
KeywordSchema.index({ username: 1 });
KeywordSchema.index({ timestamp: 1 });
KeywordSchema.index({ ip: 1 });

// Create and export the Keyword model
export const Keyword = mongoose.models.Keyword || mongoose.model<IKeyword>('Keyword', KeywordSchema);