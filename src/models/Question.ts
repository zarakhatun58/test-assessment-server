import mongoose, { Document, Schema, Types } from 'mongoose';

export enum Competency {
    COMPUTER_BASICS = 'Computer Basics',
    INTERNET_USAGE = 'Internet Usage',
    EMAIL_COMMUNICATION = 'Email Communication',
    WORD_PROCESSING = 'Word Processing',
    SPREADSHEETS = 'Spreadsheets',
    PRESENTATIONS = 'Presentations',
    DATABASE_MANAGEMENT = 'Database Management',
    CYBERSECURITY = 'Cybersecurity',
    DIGITAL_CONTENT_CREATION = 'Digital Content Creation',
    CLOUD_COMPUTING = 'Cloud Computing',
    PROGRAMMING_FUNDAMENTALS = 'Programming Fundamentals',
    NETWORKING = 'Networking',
    DATA_ANALYSIS = 'Data Analysis',
    SOFTWARE_INSTALLATION = 'Software Installation',
    MOBILE_DEVICES = 'Mobile Devices',
    ONLINE_COLLABORATION = 'Online Collaboration',
    DIGITAL_ETHICS = 'Digital Ethics',
    TROUBLESHOOTING = 'Troubleshooting',
    MULTIMEDIA_EDITING = 'Multimedia Editing',
    WEB_DEVELOPMENT = 'Web Development',
    PROJECT_MANAGEMENT = 'Project Management',
    ARTIFICIAL_INTELLIGENCE = 'Artificial Intelligence',
}

export enum Level {
    A1 = 'A1',
    A2 = 'A2',
    B1 = 'B1',
    B2 = 'B2',
    C1 = 'C1',
    C2 = 'C2',
}

export interface IQuestion extends Document {
    _id: Types.ObjectId;
    competency: Competency;
    level: Level;
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
    createdAt: Date;
    updatedAt: Date;
}


const QuestionSchema = new Schema<IQuestion>(
    {
        competency: { type: String, enum: Object.values(Competency), required: true },
        level: { type: String, enum: Object.values(Level), required: true },
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswerIndex: { type: Number, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IQuestion>('Question', QuestionSchema);
