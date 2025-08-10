import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id?: string;
  userId?: string;
  role?: string;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'your_access_secret_here';

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as JwtPayload;

    // Extract user ID from either 'id' or 'userId' fields
    const userId = decoded.id || decoded.userId || '';
    const role = decoded.role || '';

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
    }

    req.user = { id: userId, role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

export function verifyAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: No user info' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  next();
}
