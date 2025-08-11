export declare function signAccessToken(payload: object): string;
export declare function signRefreshToken(payload: object): string;
import { JwtPayload } from 'jsonwebtoken';
export declare function verifyAccessToken(token: string): JwtPayload | null;
export declare function verifyRefreshToken(token: string): JwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map