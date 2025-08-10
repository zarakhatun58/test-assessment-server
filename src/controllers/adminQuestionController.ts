import { Request, Response } from 'express';
import Question from '../models/Question';
import { IQuestion } from '../models/Question';  // Your Question interface
import { FilterQuery } from 'mongoose';

// GET /api/admin/questions?level=A1&limit=100&page=1
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const level = req.query.level as string | undefined;
    const limit = parseInt(req.query.limit as string) || 100;
    const page = parseInt(req.query.page as string) || 1;

       const filter: FilterQuery<IQuestion> = {};
    if (level) filter.level = level as any;

    const questions = await Question.find(filter)
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const total = await Question.countDocuments(filter);

    res.json({
      success: true,
      data: questions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

// POST /api/admin/questions
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const questionData: IQuestion = req.body;
    const question = new Question(questionData);
    await question.save();

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
};

// PUT /api/admin/questions/:id
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updatedData: Partial<IQuestion> = req.body;

    const question = await Question.findByIdAndUpdate(id, updatedData, { new: true });
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    res.json({ success: true, data: question });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
};

// DELETE /api/admin/questions/:id
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
};
