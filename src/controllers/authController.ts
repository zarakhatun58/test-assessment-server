import { Request, Response } from 'express';
import SchoolUser, { UserRole } from '../models/SchoolUser';
import bcrypt from 'bcryptjs';
import { generateOTP } from '../utils/otp';
import { sendEmail } from '../utils/email';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'accesssecret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshsecret';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await SchoolUser.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      } else {
        existingUser.password = await bcrypt.hash(password, 10); // update password too
        existingUser.otp = generateOTP();
        existingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await existingUser.save();

        await sendEmail(email, 'Verify your Test_School account', `Your new OTP is: ${existingUser.otp}`);
        return res.status(200).json({ success: true, message: 'OTP resent. Please verify email.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = new SchoolUser({
      name,
      email,
      password: hashedPassword,
      role: role || UserRole.STUDENT,
      otp,
      otpExpires,
    });

    await user.save();

    await sendEmail(email, 'Verify your Test_School account', `Your verification OTP is: ${otp}`);

    return res.status(201).json({
      success: true,
      message: 'User registered. Please verify email.',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function verifyOTP(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }

    const user = await SchoolUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // ✅ Issue tokens immediately after verification so user doesn't have to login again
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    return res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
      message: 'Email verified successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

function generateAccessToken(userId: string, role: string) {
  return jwt.sign(
    { id: userId, role }, 
    ACCESS_SECRET,
    { expiresIn: '90m' }
  );
}

function generateRefreshToken(userId: string) {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await SchoolUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Email not verified' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  // Ensure completedSteps exists
  if (!user.completedSteps) {
    user.completedSteps = [];
  }
    const accessToken = generateAccessToken(user._id.toString() , user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

   return res.json({
  success: true,
  data: {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      certificationLevel: user.certificationLevel || null,
      nextStep: user.nextStep || null,
      canRetakeStep1: user.canRetakeStep1 ?? true,
      completedSteps: user.completedSteps || []
    },
    accessToken,
    refreshToken
  }
});

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}


export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await SchoolUser.findOne({ email });
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
    await sendEmail(user.email, 'Password Reset Request', message);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Email sending failed' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  // Find user by token and check expiry
  const user = await SchoolUser.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  // Clear reset token fields
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.status(200).json({ message: 'Password has been reset successfully' });
};
