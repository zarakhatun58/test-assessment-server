import mongoose, { Document, Types } from 'mongoose';
export declare enum UserRole {
    ADMIN = "admin",
    STUDENT = "student",
    SUPERVISOR = "supervisor"
}
export interface ISchoolUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isVerified: boolean;
    otp?: string;
    otpExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    certificationLevel?: string | null;
    nextStep?: string | null;
    canRetakeStep1?: boolean;
    completedSteps: number[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ISchoolUser, {}, {}, {}, mongoose.Document<unknown, {}, ISchoolUser, {}, {}> & ISchoolUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=SchoolUser.d.ts.map