"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const questionModel_1 = __importStar(require("../models/questionModel"));
const SchoolUser_1 = __importDefault(require("../models/SchoolUser"));
const router = express_1.default.Router();
const levelsByStep = {
    '1': [questionModel_1.Level.A1, questionModel_1.Level.A2],
    '2': [questionModel_1.Level.B1, questionModel_1.Level.B2],
    '3': [questionModel_1.Level.C1, questionModel_1.Level.C2],
};
router.get('/questions/:step/:competency', async (req, res) => {
    try {
        const step = req.params.step;
        const competency = req.params.competency;
        if (!Object.values(questionModel_1.Competency).includes(competency)) {
            return res.status(400).json({ error: 'Invalid competency' });
        }
        const levels = levelsByStep[step];
        if (!levels) {
            return res.status(400).json({ error: 'Invalid step' });
        }
        const questions = await questionModel_1.default.find({
            competency,
            level: { $in: levels },
        });
        const result = questions.map(q => ({
            id: q._id.toString(),
            questionText: q.questionText,
            options: q.options,
        }));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/submit/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { answers, step } = req.body;
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }
        const user = await SchoolUser_1.default.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!Array.isArray(answers)) {
            return res.status(400).json({ error: 'Invalid answers format' });
        }
        const questionIds = answers.map((a) => a.questionId);
        const questions = await questionModel_1.default.find({
            _id: { $in: questionIds },
        });
        let correctCount = 0;
        answers.forEach((answer) => {
            const question = questions.find(q => q._id.toString() === answer.questionId);
            if (question && question.correctAnswerIndex === answer.answerIndex) {
                correctCount++;
            }
        });
        const totalQuestions = questions.length;
        const score = totalQuestions ? (correctCount / totalQuestions) * 100 : 0;
        // Fetch user doc again for update
        const userDoc = await SchoolUser_1.default.findById(userId);
        if (!userDoc)
            return res.status(404).json({ error: 'User not found' });
        if (score >= 70) {
            userDoc.certificationLevel = step;
            userDoc.nextStep = (parseInt(step) + 1).toString();
            userDoc.canRetakeStep1 = false;
        }
        else {
            userDoc.canRetakeStep1 = true;
        }
        await userDoc.save();
        res.json({ score, passed: score >= 70, nextStep: userDoc.nextStep });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
