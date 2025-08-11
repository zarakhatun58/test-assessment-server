import mongoose, { Document, Types } from 'mongoose';
export interface IAssessmentResult extends Document {
    userId: Types.ObjectId;
    sessionId: Types.ObjectId;
    step: number;
    score: number;
    percentage: number;
    levelAchieved: string | null;
    certification: string | null;
    canProceed: boolean;
    timeSpent: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAssessmentResult, {}, {}, {}, mongoose.Document<unknown, {}, IAssessmentResult, {}, {}> & IAssessmentResult & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=AssessmentResult.d.ts.map