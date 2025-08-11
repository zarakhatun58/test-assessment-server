"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const SchoolUser_1 = __importDefault(require("../models/SchoolUser"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/register', authController_1.register);
router.post('/verify-otp', authController_1.verifyOTP);
router.post('/login', authController_1.login);
router.post('/forgot-password', authController_1.forgotPassword);
router.post('/reset-password', authController_1.resetPassword);
router.get('/profile', authMiddleware_1.verifyToken, async (req, res) => {
    try {
        const user = await SchoolUser_1.default.findById(req.user.id).select('-password -otp -otpExpires -passwordResetToken -passwordResetExpires');
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
