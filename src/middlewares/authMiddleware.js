"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
exports.verifyAdmin = verifyAdmin;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'your_access_secret_here';
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
        // Extract user ID from either 'id' or 'userId' fields
        const userId = decoded.id || decoded.userId || '';
        const role = decoded.role || '';
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
        }
        req.user = { id: userId, role };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
}
function verifyAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: No user info' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
}
//# sourceMappingURL=authMiddleware.js.map