// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import adminQuestionRoutes from './routes/adminQuestionRoutes';


dotenv.config();

const app = express();
// app.use(cors());
app.use(cors({
  origin: 'https://test-exam-client.onrender.com', 
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/admin', adminQuestionRoutes);
export default app;
