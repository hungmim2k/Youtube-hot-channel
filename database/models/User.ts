import mongoose, { Document, Schema } from 'mongoose';

// Define the role type
export type Role = 'admin' | 'user';

// Define the expiration type
export type Expiration = 'never' | string;

// Define the User interface
export interface IUser extends Document {
  username: string;
  password: string;
  role: Role;
  expiration: Expiration;
  apiKeys: string[];
  createdAt: Date;
}

// Create the User schema
const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  expiration: {
    type: Schema.Types.Mixed,
    default: 'never',
    validate: {
      validator: function(value: any) {
        return value === 'never' || (typeof value === 'string' && !isNaN(Date.parse(value)));
      },
      message: 'Expiration must be "never" or a valid date string'
    }
  },
  apiKeys: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for efficient queries
UserSchema.index({ username: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ expiration: 1 });

// Create and export the User model
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// Default admin user
export const DEFAULT_ADMIN = {
  username: 'admin',
  password: '0968885430',
  role: 'admin' as Role,
  expiration: 'never' as Expiration,
  apiKeys: [],
  createdAt: new Date(),
};