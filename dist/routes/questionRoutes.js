"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const questionModel_1 = __importDefault(require("../models/questionModel"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Middleware array for admin-only routes
const adminMiddleware = [authMiddleware_1.verifyToken, authMiddleware_1.verifyAdmin];
// Create Question (Admin only)
router.post('/', adminMiddleware, async (req, res) => {
    try {
        const question = new questionModel_1.default(req.body);
        await question.save();
        res.status(201).json(question);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to create question', error });
    }
});
// Get Questions with pagination (Admin only)
router.get('/', adminMiddleware, async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const questions = await questionModel_1.default.find()
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await questionModel_1.default.countDocuments();
        res.json({ questions, total, page, pages: Math.ceil(total / limit) });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch questions', error });
    }
});
// Update Question (Admin only)
router.put('/:id', adminMiddleware, async (req, res) => {
    try {
        const question = await questionModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!question)
            return res.status(404).json({ message: 'Question not found' });
        res.json(question);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to update question', error });
    }
});
// Delete Question (Admin only)
router.delete('/:id', adminMiddleware, async (req, res) => {
    try {
        const question = await questionModel_1.default.findByIdAndDelete(req.params.id);
        if (!question)
            return res.status(404).json({ message: 'Question not found' });
        res.json({ message: 'Question deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete question', error });
    }
});
// Example Admin-only data route
router.get('/admin-data', adminMiddleware, (req, res) => {
    res.json({ secret: 'This is admin-only data' });
});
exports.default = router;
