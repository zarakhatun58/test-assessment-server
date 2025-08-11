import mongoose, { Document, Types } from 'mongoose';
export interface IAssessmentSession extends Document {
    userId: Types.ObjectId;
    step: number;
    questions: Types.ObjectId[];
    answers: (number | null)[];
    currentQuestionIndex: number;
    startTime: Date;
    timeLimit: number;
    status: 'in_progress' | 'submitted' | 'auto_submitted';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAssessmentSession, {}, {}, {}, mongoose.Document<unknown, {}, IAssessmentSession, {}, {}> & IAssessmentSession & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=AssessmentSession.d.ts.map