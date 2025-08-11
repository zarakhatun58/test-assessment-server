"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestion = exports.updateQuestion = exports.createQuestion = exports.getQuestions = void 0;
const Question_1 = __importDefault(require("../models/Question"));
// GET /api/admin/questions?level=A1&limit=100&page=1
const getQuestions = async (req, res) => {
    try {
        const level = req.query.level;
        const limit = parseInt(req.query.limit) || 100;
        const page = parseInt(req.query.page) || 1;
        const filter = {};
        if (level)
            filter.level = level;
        const questions = await Question_1.default.find(filter)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        const total = await Question_1.default.countDocuments(filter);
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getQuestions = getQuestions;
// POST /api/admin/questions
const createQuestion = async (req, res) => {
    try {
        const questionData = req.body;
        const question = new Question_1.default(questionData);
        await question.save();
        res.status(201).json({ success: true, data: question });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.createQuestion = createQuestion;
// PUT /api/admin/questions/:id
const updateQuestion = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const question = await Question_1.default.findByIdAndUpdate(id, updatedData, { new: true });
        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }
        res.json({ success: true, data: question });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.updateQuestion = updateQuestion;
// DELETE /api/admin/questions/:id
const deleteQuestion = async (req, res) => {
    try {
        const id = req.params.id;
        const question = await Question_1.default.findByIdAndDelete(id);
        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }
        res.json({ success: true, message: 'Question deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.deleteQuestion = deleteQuestion;
