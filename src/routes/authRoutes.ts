import express from 'express';
import { register, login , verifyOTP, forgotPassword,resetPassword} from '../controllers/authController';
import SchoolUser from '../models/SchoolUser';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', verifyToken, async (req: any, res:any) => {
  try {
    const user = await SchoolUser.findById(req.user.id).select('-password -otp -otpExpires -passwordResetToken -passwordResetExpires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 
