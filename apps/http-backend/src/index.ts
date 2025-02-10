import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config';
import { userValidation } from './middleware/userValidation';

const app = express();

app.get('/sign-in', (req, res) => {
    res.status(200).json({
        body: {
            message: 'This is the sigin-in endpoint',
        },
    });
});

app.get('/sign-up', (req, res) => {
    const userID = 1;
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

    res.status(200).json({
        body: {
            roomID: 1234,
            message: 'This is the create-room endpoint',
        },
    });
});

app.listen(3003);
