"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/assessmentRoutes.ts
const express_1 = __importDefault(require("express"));
const assessmentController_1 = require("../controllers/assessmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware"); // your JWT middleware
const router = express_1.default.Router();
// public: questions for step (may be protected if you want)
// router.get('/questions/:step', verifyToken, getQuestionsForStep);
router.get('/questions/:step', assessmentController_1.getQuestionsForStep);
router.get('/current', authMiddleware_1.verifyToken, assessmentController_1.getCurrentSession);
router.post('/start', authMiddleware_1.verifyToken, assessmentController_1.startAssessment);
router.post('/answer', authMiddleware_1.verifyToken, assessmentController_1.submitAnswer);
router.post('/submit', authMiddleware_1.verifyToken, assessmentController_1.submitAssessment);
router.get('/can-take', authMiddleware_1.verifyToken, assessmentController_1.canTakeAssessment);
exports.default = router;
