// src/models/AssessmentResult.ts
import mongoose, { Document, Schema, Types } from 'mongoose';
import { Level } from './Question';

export interface IAssessmentResult extends Document {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  step: number;
  score: number;
  percentage: number;
  levelAchieved: string | null; // e.g. 'A1','A2'...
  certification: string | null; // human readable
  canProceed: boolean;
  timeSpent: number; // seconds
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentResultSchema = new Schema<IAssessmentResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'SchoolUser', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'AssessmentSession', required: true },
    step: { type: Number, required: true },
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    levelAchieved: { type: String, enum: Object.values(Level), default: null },
    certification: { type: String },
    canProceed: { type: Boolean, default: false },
    timeSpent: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAssessmentResult>('AssessmentResult', AssessmentResultSchema);
