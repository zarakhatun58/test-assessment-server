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
exports.resetPassword = exports.forgotPassword = void 0;
exports.register = register;
exports.verifyOTP = verifyOTP;
exports.login = login;
const SchoolUser_1 = __importStar(require("../models/SchoolUser"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const otp_1 = require("../utils/otp");
const email_1 = require("../utils/email");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'accesssecret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refreshsecret';
async function register(req, res) {
    try {
        const { email, password, role } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }
        const existingUser = await SchoolUser_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const otp = (0, otp_1.generateOTP)();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
        const user = new SchoolUser_1.default({
            email,
            password: hashedPassword,
            role: role || SchoolUser_1.UserRole.STUDENT,
            otp,
            otpExpires,
        });
        await user.save();
        await (0, email_1.sendEmail)(email, 'Verify your Test_School account', `Your verification OTP is: ${otp}`);
        return res
            .status(201)
            .json({ message: 'User registered. Please verify email.' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
}
async function verifyOTP(req, res) {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP required' });
        }
        const user = await SchoolUser_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }
        if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        return res.json({ message: 'Email verified successfully' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
}
function generateAccessToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, ACCESS_SECRET, { expiresIn: '15m' });
}
function generateRefreshToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }
        const user = await SchoolUser_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Email not verified' });
        }
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());
        return res.json({
            accessToken,
            refreshToken,
            message: 'Login successful',
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
}
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await SchoolUser_1.default.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    // Generate token (random hex string)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    // Save token and expiry to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();
    // Compose reset link (frontend URL)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // Send email
    const message = `You requested a password reset. Click here to reset your password: ${resetUrl}\n\nIf you did not request this, ignore this email.`;
    try {
        await (0, email_1.sendEmail)(user.email, 'Password Reset Request', message);
        res.status(200).json({ message: 'Password reset email sent' });
    }
    catch (error) {
        res.status(500).json({ message: 'Email sending failed' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    // Find user by token and check expiry
    const user = await SchoolUser_1.default.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
    });
    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }
    // Hash new password
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    user.password = hashedPassword;
    // Clear reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(200).json({ message: 'Password has been reset successfully' });
};
exports.resetPassword = resetPassword;
