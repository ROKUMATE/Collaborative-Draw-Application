import { NextFunction, Request, Response } from 'express';
import { JWT_SECRET } from '@repo/backend-common/config';
import jwt, { decode, JwtPayload } from 'jsonwebtoken';
import { number, z } from 'zod';

declare module 'express' {
    interface Request {
        userID?: string;
    }
}

const decodedSchema = z.object({
    userID: z.string(),
    iat: z.number(),
});

export function userValidation(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const token = req.headers['authorization'];
    console.log(token);

    if (!token) {
        res.status(403).json({
            message: 'Token not found - User Unauthorized',
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded Token is as follows - ', decoded);
        if (
            typeof decoded === 'object' &&
            decoded !== null &&
            decoded.userID != null
        ) {
            const parsed = decodedSchema.safeParse(decoded);
            console.log(parsed);
            if (parsed.success) {
                req.userID = parsed.data.userID;
                next();
                return;
            }
        }
        res.status(403).json({
            message: 'Wrong Token Provided - User Unauthorized',
        });
    } catch (error) {
        res.status(403).json({
            message: 'Error in token authentication - User Unauthorized',
        });
    }
}
