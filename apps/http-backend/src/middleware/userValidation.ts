import { NextFunction, Request, Response } from 'express';
import { JWT_SECRET } from '../config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { z } from 'zod';

declare module 'express' {
    interface Request {
        userID?: number;
    }
}

const decodedSchema = z.object({
    userID: z.number(),
});

export function userValidation(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const token = req.headers['authorization'];

    if (!token) {
        res.status(403).json({
            message: 'User Unauthorized',
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (
            typeof decoded === 'object' &&
            decoded !== null &&
            'userID' in decoded
        ) {
            const parsed = decodedSchema.safeParse(decoded);
            if (parsed.success) {
                req.userID = parsed.data.userID;
                next();
                return;
            }
        }
        res.status(403).json({ message: 'User Unauthorized' });
    } catch (error) {
        res.status(403).json({
            message: 'User Unauthorized',
        });
    }
}
