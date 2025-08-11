"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminQuestionController_1 = require("../controllers/adminQuestionController");
// middleware to check admin role
const router = express_1.default.Router();
// All routes protected by isAdmin middleware
// router.use(isAdmin);
// GET /api/admin/questions?level=A1&limit=100&page=1
router.get('/questions', adminQuestionController_1.getQuestions);
// POST /api/admin/questions
router.post('/questions', adminQuestionController_1.createQuestion);
// PUT /api/admin/questions/:id
router.put('/questions/:id', adminQuestionController_1.updateQuestion);
// DELETE /api/admin/questions/:id
router.delete('/questions/:id', adminQuestionController_1.deleteQuestion);
exports.default = router;
