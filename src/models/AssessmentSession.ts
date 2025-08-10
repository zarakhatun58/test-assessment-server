// src/models/AssessmentSession.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAssessmentSession extends Document {
  userId: Types.ObjectId;
  step: number; // 1 | 2 | 3
  questions: Types.ObjectId[]; // references to Question
  answers: (number | null)[];
  currentQuestionIndex: number;
  startTime: Date;
  timeLimit: number; // seconds
  status: 'in_progress' | 'submitted' | 'auto_submitted';
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSessionSchema = new Schema<IAssessmentSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'SchoolUser', required: true },
  step: { type: Number, enum: [1, 2, 3], required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question', required: true }],
    answers: [{ type: Number, default: null }],
    currentQuestionIndex: { type: Number, default: 0 },
    startTime: { type: Date, required: true },
    timeLimit: { type: Number, required: true },
    status: { type: String, enum: ['in_progress', 'submitted', 'auto_submitted'], default: 'in_progress' },
  },
  { timestamps: true }
);

export default mongoose.model<IAssessmentSession>('AssessmentSession', AssessmentSessionSchema);
