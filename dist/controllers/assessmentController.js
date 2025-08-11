"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAssessment = void 0;
exports.getQuestionsForStep = getQuestionsForStep;
exports.startAssessment = startAssessment;
exports.getCurrentSession = getCurrentSession;
exports.submitAnswer = submitAnswer;
exports.canTakeAssessment = canTakeAssessment;
const Question_1 = __importDefault(require("../models/Question"));
const AssessmentSession_1 = __importDefault(require("../models/AssessmentSession"));
const SchoolUser_1 = __importDefault(require("../models/SchoolUser"));
// Helper: levels by step
const LEVELS_BY_STEP = {
    1: ['A1', 'A2'],
    2: ['B1', 'B2'],
    3: ['C1', 'C2'],
};
// Score -> certification / progression logic per spec
function evaluateStepResult(step, percentage) {
    // returns { levelAchieved, certification, canProceed, failureNoRetake }
    if (step === 1) {
        if (percentage < 25)
            return { levelAchieved: null, certification: 'Fail', canProceed: false, failureNoRetake: true };
        if (percentage < 50)
            return { levelAchieved: 'A1', certification: 'A1 certified', canProceed: false, failureNoRetake: false };
        if (percentage < 75)
            return { levelAchieved: 'A2', certification: 'A2 certified', canProceed: false, failureNoRetake: false };
        return { levelAchieved: 'A2', certification: 'A2 certified', canProceed: true, failureNoRetake: false };
    }
    if (step === 2) {
        if (percentage < 25)
            return { levelAchieved: 'A2', certification: 'Remain at A2', canProceed: false, failureNoRetake: false };
        if (percentage < 50)
            return { levelAchieved: 'B1', certification: 'B1 certified', canProceed: false, failureNoRetake: false };
        if (percentage < 75)
            return { levelAchieved: 'B2', certification: 'B2 certified', canProceed: false, failureNoRetake: false };
        return { levelAchieved: 'B2', certification: 'B2 certified', canProceed: true, failureNoRetake: false };
    }
    if (step === 3) {
        if (percentage < 25)
            return { levelAchieved: 'B2', certification: 'Remain at B2', canProceed: false, failureNoRetake: false };
        if (percentage < 50)
            return { levelAchieved: 'C1', certification: 'C1 certified', canProceed: false, failureNoRetake: false };
        return { levelAchieved: 'C2', certification: 'C2 certified', canProceed: false, failureNoRetake: false };
    }
    return { levelAchieved: null, certification: null, canProceed: false, failureNoRetake: false };
}
/**
 * GET /api/assessment/questions/:step
 * Return questions for step (choice of levels for step).
 * We return question docs - but hide correctAnswerIndex field.
 */
async function getQuestionsForStep(req, res) {
    const step = Number(req.params.step);
    if (![1, 2, 3].includes(step))
        return res.status(400).json({ success: false, message: 'Invalid step' });
    const levels = LEVELS_BY_STEP[step];
    // Fetch 44 questions only for this step's levels
    const questions = await Question_1.default.find({ level: { $in: levels } })
        .select('questionText options competency level')
        .limit(44) // limit to 44 questions per step
        .lean();
    return res.json({ success: true, data: { questions } });
}
/**
 * POST /api/assessment/start
 * body { step }
 * Create a session for the user, pick 44 questions (or configured count) from relevant levels.
 */
async function startAssessment(req, res) {
    try {
        const userIdStr = req.user?.id;
        if (!userIdStr)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const step = Number(req.body.step);
        if (![1, 2, 3].includes(step))
            return res.status(400).json({ success: false, message: 'Invalid step' });
        // check permission: user must be allowed to take this step
        const user = await SchoolUser_1.default.findById(userIdStr);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        // Prevent retake on Step 1 fail
        if (step === 1 && user.canRetakeStep1 === false) {
            return res.status(403).json({ success: false, message: 'Step 1 retake not allowed' });
        }
        // Optional: check completed steps for access to step 2/3
        if (step === 2 && !(user.completedSteps || []).includes(1)) {
            return res.status(403).json({ success: false, message: 'You must pass Step 1 to access Step 2' });
        }
        if (step === 3 && !(user.completedSteps || []).includes(2)) {
            return res.status(403).json({ success: false, message: 'You must pass Step 2 to access Step 3' });
        }
        // Select questions: choose from relevant levels, randomize, limit to 44
        const levels = LEVELS_BY_STEP[step];
        const totalNeeded = 44;
        const questions = await Question_1.default.aggregate([
            { $match: { level: { $in: levels } } },
            { $sample: { size: totalNeeded } },
            { $project: { _id: 1 } }
        ]);
        const qIds = questions.map((q) => q._id);
        const timeLimit = totalNeeded * 60; // 1 minute per question
        const session = new AssessmentSession_1.default({
            userId: user._id,
            step,
            questions: qIds,
            answers: new Array(qIds.length).fill(null),
            currentQuestionIndex: 0,
            startTime: new Date(),
            timeLimit,
            status: 'in_progress'
        });
        await session.save();
        return res.status(201).json({ success: true, data: { sessionId: session._id, startTime: session.startTime, timeLimit, questions: qIds }, message: 'Assessment started' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}
/**
 * GET /api/assessment/current
 * Return current in-progress session for user
 */
async function getCurrentSession(req, res) {
    const userIdStr = req.user?.id;
    if (!userIdStr)
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    const session = await AssessmentSession_1.default.findOne({ userId: userIdStr, status: 'in_progress' }).lean();
    if (!session)
        return res.json({ success: true, data: null });
    // populate questions details for UI if needed (hide correctAnswerIndex)
    const questions = await Question_1.default.find({ _id: { $in: session.questions } }).select('questionText options competency level').lean();
    return res.json({
        success: true,
        data: {
            ...session,
            questions
        }
    });
}
/**
 * POST /api/assessment/answer
 * body { sessionId, questionIndex, answer (number) }
 * Save one answer to the session.
 */
async function submitAnswer(req, res) {
    try {
        const userIdStr = req.user?.id;
        if (!userIdStr)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { sessionId, questionIndex, answer } = req.body;
        if (!sessionId || typeof questionIndex !== 'number' || typeof answer !== 'number') {
            return res.status(400).json({ success: false, message: 'Invalid payload' });
        }
        const session = await AssessmentSession_1.default.findById(sessionId);
        if (!session)
            return res.status(404).json({ success: false, message: 'Session not found' });
        if (session.userId.toString() !== userIdStr)
            return res.status(403).json({ success: false, message: 'Forbidden' });
        session.answers[questionIndex] = answer;
        await session.save();
        return res.json({ success: true, message: 'Answer saved' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}
/**
 * POST /api/assessment/submit
 * body { sessionId }
 * Calculate score, persist result, update user certification & completedSteps.
 */
const submitAssessment = async (req, res) => {
    try {
        const { step, score } = req.body;
        const userId = req.user.id; // from JWT middleware
        if (![1, 2, 3].includes(step)) {
            return res.status(400).json({ message: 'Invalid step number' });
        }
        if (typeof score !== 'number' || score < 0 || score > 100) {
            return res.status(400).json({ message: 'Score must be 0–100' });
        }
        const user = await SchoolUser_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        let certificationLevel = user.certificationLevel || null;
        let nextStep = user.nextStep || null;
        let canRetakeStep1 = user.canRetakeStep1 ?? true;
        // Step logic
        if (step === 1) {
            if (score < 25) {
                certificationLevel = null;
                canRetakeStep1 = false;
                nextStep = null;
            }
            else if (score < 50) {
                certificationLevel = 'A1';
                nextStep = null;
            }
            else if (score < 75) {
                certificationLevel = 'A2';
                nextStep = null;
            }
            else {
                certificationLevel = 'A2';
                nextStep = 'Step 2';
            }
        }
        if (step === 2) {
            if (score < 25) {
                // remain at A2
            }
            else if (score < 50) {
                certificationLevel = 'B1';
                nextStep = null;
            }
            else if (score < 75) {
                certificationLevel = 'B2';
                nextStep = null;
            }
            else {
                certificationLevel = 'B2';
                nextStep = 'Step 3';
            }
        }
        if (step === 3) {
            if (score < 25) {
                // remain at B2
            }
            else if (score < 50) {
                certificationLevel = 'C1';
            }
            else {
                certificationLevel = 'C2';
            }
            nextStep = null;
        }
        // Track completed steps
        const completedSteps = new Set(user.completedSteps || []);
        if (!user.completedSteps.includes(step)) {
            user.completedSteps.push(step);
        }
        user.certificationLevel = certificationLevel;
        user.nextStep = nextStep;
        user.canRetakeStep1 = canRetakeStep1;
        user.completedSteps = Array.from(completedSteps);
        await user.save();
        res.json({
            success: true,
            message: `Step ${step} submitted successfully`,
            data: {
                certificationLevel,
                nextStep,
                canRetakeStep1,
                completedSteps: user.completedSteps,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.submitAssessment = submitAssessment;
/**
 * GET /api/assessment/can-take?step=1
 * Returns whether user can take selected step
 */
async function canTakeAssessment(req, res) {
    try {
        const userIdStr = req.user?.id;
        if (!userIdStr)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const step = Number(req.query.step);
        if (![1, 2, 3].includes(step))
            return res.status(400).json({ success: false, message: 'Invalid step' });
        const user = await SchoolUser_1.default.findById(userIdStr);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        // Step-specific rules
        if (step === 1) {
            const canTake = user.canRetakeStep1 !== false; // default true
            return res.json({ success: true, data: { canTake, reason: canTake ? null : 'Retake not allowed for Step 1' } });
        }
        if (step === 2) {
            const canTake = (user.completedSteps || []).includes(1) || (user.certificationLevel === 'A2');
            // if user reached A2 previously they can take step2
            return res.json({ success: true, data: { canTake, reason: canTake ? null : 'You must complete Step 1 (A2) first' } });
        }
        if (step === 3) {
            const canTake = (user.completedSteps || []).includes(2) || (user.certificationLevel === 'B2');
            return res.json({ success: true, data: { canTake, reason: canTake ? null : 'You must complete Step 2 (B2) first' } });
        }
        return res.json({ success: true, data: { canTake: false } });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}
