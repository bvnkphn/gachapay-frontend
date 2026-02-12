import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    _id: string;
    email: string;
    password: string;
    profile: {
        username?: string;
        display_name?: string;
        avatar_url?: string;
    };
    created_at: Date;
    updated_at: Date;
}

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    profile: {
        username: {
            type: String,
            trim: true,
        },
        display_name: {
            type: String,
            trim: true,
        },
        avatar_url: {
            type: String,
        },
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

// Update the updated_at field before saving
UserSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ 'profile.username': 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);