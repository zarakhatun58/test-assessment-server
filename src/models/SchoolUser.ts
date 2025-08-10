import mongoose, { Document, Schema, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  SUPERVISOR = 'supervisor',
}

export interface ISchoolUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;

  // Auth & verification
  otp?: string;
  otpExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  // Assessment tracking
  certificationLevel?: string | null; // A1 → C2
  nextStep?: string | null; // Step 1, Step 2, Step 3
  canRetakeStep1?: boolean; // for Step 1 fail logic
  completedSteps: number[]; // e.g. [1, 2]
  
  createdAt: Date;
  updatedAt: Date;
}

const SchoolUserSchema = new Schema<ISchoolUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    isVerified: { type: Boolean, default: false },

    otp: { type: String },
    otpExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },

    certificationLevel: { type: String, enum: ['A1','A2','B1','B2','C1','C2'] },
    nextStep: { type: String, enum: ['1', '2', '3'] },
    canRetakeStep1: { type: Boolean, default: true },
    completedSteps: { type: [Number], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<ISchoolUser>('SchoolUser', SchoolUserSchema);
