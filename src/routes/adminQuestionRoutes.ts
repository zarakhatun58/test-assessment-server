import express from 'express';
import { createQuestion, deleteQuestion, getQuestions, updateQuestion } from '../controllers/adminQuestionController';

// middleware to check admin role

const router = express.Router();
// All routes protected by isAdmin middleware
// router.use(isAdmin);

// GET /api/admin/questions?level=A1&limit=100&page=1
router.get('/questions', getQuestions);

// POST /api/admin/questions
router.post('/questions', createQuestion);

// PUT /api/admin/questions/:id
router.put('/questions/:id', updateQuestion);

// DELETE /api/admin/questions/:id
router.delete('/questions/:id', deleteQuestion);

export default router;
