import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { userValidation } from './middleware/userValidation';
import {
    createRoomSchema,
    createUserSchema,
    signInSchema,
} from '@repo/common/types';

const app = express();

app.get('/sign-in', (req, res) => {
    const data = createUserSchema.safeParse(req.body);
    if (!data.success) {
        res.status(401).json({
            body: {
                message: 'Data not given in proper format',
            },
        });
        return;
    }
    res.status(200).json({
        body: {
            message: 'This is the sigin-in endpoint',
        },
    });
});

app.get('/sign-up', (req, res) => {
    const userID = 1;
    const data = signInSchema.safeParse(req.body);
    if (!data.success) {
        res.status(401).json({
            body: {
                message: 'Data not given in proper format',
            },
        });
        return;
    }
    const token = jwt.sign(
        {
            userID,
        },
        JWT_SECRET
    );
    res.status(200).json({
        body: {
            token: token,
            message: 'This is the sigin-up endpoint',
        },
    });
});

app.get('/create-room', userValidation, (req, res) => {
    // Database Calls
    const data = createRoomSchema.safeParse(req.body);
    if (!data.success) {
        res.status(401).json({
            body: {
                message: 'Data not given in proper format',
            },
        });
        return;
    }

    res.status(200).json({
        body: {
            roomID: 1234,
            message: 'This is the create-room endpoint',
        },
    });
});

app.listen(3003);
