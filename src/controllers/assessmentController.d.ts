import { Request, Response } from 'express';
/**
 * GET /api/assessment/questions/:step
 * Return questions for step (choice of levels for step).
 * We return question docs - but hide correctAnswerIndex field.
 */
export declare function getQuestionsForStep(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * POST /api/assessment/start
 * body { step }
 * Create a session for the user, pick 44 questions (or configured count) from relevant levels.
 */
export declare function startAssessment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * GET /api/assessment/current
 * Return current in-progress session for user
 */
export declare function getCurrentSession(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * POST /api/assessment/answer
 * body { sessionId, questionIndex, answer (number) }
 * Save one answer to the session.
 */
export declare function submitAnswer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * POST /api/assessment/submit
 * body { sessionId }
 * Calculate score, persist result, update user certification & completedSteps.
 */
export declare const submitAssessment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/assessment/can-take?step=1
 * Returns whether user can take selected step
 */
export declare function canTakeAssessment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=assessmentController.d.ts.map