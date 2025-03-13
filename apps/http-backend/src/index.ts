import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { userValidation } from './middleware/userValidation';
import {
    createRoomSchema,
    createUserSchema,
    signInSchema,
} from '@repo/common/types';
import { prismaClient } from '@repo/db/db';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use(cors());

// declare global {
//     namespace Express {
//         interface Request {
//             userID?: string;
//         }
//     }
// }

// SignIn Endpoint
app.post('/sign-in', async (req, res) => {
    const data = createUserSchema.safeParse(req.body);
    if (!data.success) {
        res.status(401).json({
            body: {
                message: 'Data not given in proper format',
            },
        });
        return;
    }
    // console.log(data);
    const hashedPassword = await bcrypt.hash(data.data.password, 2);
    const userDetails = data.data;
    try {
        const User = await prismaClient.user.create({
            data: {
                email: data.data?.username,
                password: hashedPassword,
                name: data.data.name,
                photo: '',
            },
        });
        if (!User) {
            res.status(401).json({
                body: {
                    message: 'There was an error while adding data to database',
                },
            });
            return;
        }
        res.status(200).json({
            body: {
                message: 'This is the sigin-in endpoint',
                userDetails: User,
            },
        });
    } catch (error) {
        res.status(404).json({
            body: {
                message:
                    'there was an error in creating a new user - probably same username ',
            },
        });
    }
});
// SignUp Endpoint
app.post('/sign-up', async (req, res) => {
    const data = signInSchema.safeParse(req.body);
    if (!data.success) {
        res.status(401).json({
            body: {
                message: 'Data not given in proper format',
            },
        });
        return;
    }
    try {
        const User = await prismaClient.user.findFirst({
            where: {
                email: data.data.username,
            },
        });
        if (User == null || !User) {
            res.status(404).json({
                body: {
                    message: 'Wrong Sign-up Credientials',
                },
            });
            return;
        }
        const userPasswordReal = await bcrypt.compare(
            data.data.password,
            User.password
        );
        if (!userPasswordReal) {
            res.status(404).json({
                body: {
                    message: 'Incorrect Password for the given user provided',
                },
            });
            return;
        }
        const token = jwt.sign(
            {
                userID: User.id,
            },
            JWT_SECRET
        );
        res.status(200).json({
            body: {
                userId: User.id,
                token: token,
                message: 'This is the sigin-up endpoint',
            },
        });
    } catch (error) {
        res.status(404).json({
            body: {
                message: 'There was an error while sign-up',
            },
        });
    }
});
// Room Creation
app.post('/create-room', userValidation, async (req, res) => {
    const data = createRoomSchema.safeParse(req.body);
    if (!data.success) {
        res.status(401).json({
            body: {
                message: 'Data not given in proper format',
            },
        });
        return;
    }
    //@ts-ignore
    const userID = req.userID;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: data.data.name,
                adminId: userID,
            },
        });
        res.status(200).json({
            roomId: room.id,
            message: 'Room has been created',
        });
        return;
    } catch (error) {
        res.status(411).json({
            message: 'Room already exists with this name',
        });
        return;
    }
});
// Getting a particular rooms chats
app.get('/chat/:roomID', async (req, res) => {
    try {
        const roomID = Number(req.params.roomID);
        if (!roomID) {
            res.status(401).json({
                body: {
                    message: 'Invalid RoomID Provided',
                },
            });
            return;
        }
        const room = await prismaClient.room.findUnique({
            where: {
                id: roomID,
            },
        });
        if (!room) {
            res.status(401).json({
                body: {
                    message: 'Room Dosent exists ',
                },
            });
            return;
        }
        const chats = await prismaClient.chat.findMany({
            where: {
                roomId: roomID,
            },
            orderBy: {
                id: 'desc',
            },
            take: 1000,
        });
        res.status(400).json({
            body: {
                message: {
                    chatMessages: chats,
                },
            },
        });
    } catch (error) {
        res.status(400).json({
            body: {
                message: 'there was an error in fetching the chats ',
            },
        });
    }
});

app.get('/room/:slug', async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug,
        },
    });

    res.status(200).json({
        room,
    });
});

app.listen(3003);
