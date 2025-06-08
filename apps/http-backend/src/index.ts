import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { userValidation } from "./middleware/userValidation";
import {
    createRoomSchema,
    createUserSchema,
    signInSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/db";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(cors());

/** JSON DATA --- Sign-in -- Creating new user
    {
        "username": "String",
        "password": "String",
        "name": "String"
    }
 */
app.post("/sign-in", async (req, res) => {
    const data = createUserSchema.safeParse(req.body);
    if (!data.success) {
        res.status(401).json({
            body: {
                message: "Data not given in proper format",
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
                email: userDetails.username,
                password: hashedPassword,
                name: userDetails.name,
            },
        });
        if (!User) {
            res.status(401).json({
                body: {
                    message: "There was an error while adding data to database",
                },
            });
            return;
        }
        res.status(200).json({
            body: {
                message: "This is the sigin-in endpoint",
                userDetails: User,
            },
        });
    } catch (error) {
        res.status(404).json({
            body: {
                message:
                    "there was an error in creating a new user - probably same username ",
            },
        });
    }
});

/** JSON DATA --- Sign-up -- login  user
    {
        "username": "String",
        "password": "String",
    }
 */
app.post("/sign-up", async (req, res) => {
    const data = signInSchema.safeParse(req.body);
    if (!data.success) {
        res.status(401).json({
            body: {
                message: "Data not given in proper format",
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
                    message: "Wrong Sign-up Credientials",
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
                    message: "Incorrect Password for the given user provided",
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
                message: "This is the sigin-up endpoint",
            },
        });
    } catch (error) {
        res.status(404).json({
            body: {
                message: "There was an error while sign-up",
            },
        });
    }
});
app.post("/create-room", userValidation, async (req, res) => {
    const data = createRoomSchema.safeParse(req.body);
    if (!data.success) {
        res.status(401).json({
            body: {
                message: "Data not given in proper format",
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
            message: "Room has been created",
        });
        return;
    } catch (error) {
        res.status(411).json({
            message: "Room already exists with this name",
        });
        return;
    }
});
app.get("/chat/:roomID", async (req, res) => {
    try {
        const roomID = Number(req.params.roomID);
        if (!roomID) {
            res.status(401).json({
                body: {
                    message: "Invalid RoomID Provided",
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
                    message: "Room Dosent exists ",
                },
            });
            return;
        }
        const chats = await prismaClient.chat.findMany({
            where: {
                roomId: roomID,
            },
            orderBy: {
                id: "desc",
            },
            take: 1000,
        });
        res.status(200).json({
            body: {
                message: {
                    chatMessages: chats,
                },
            },
        });
    } catch (error) {
        res.status(400).json({
            body: {
                message: "there was an error in fetching the chats ",
            },
        });
    }
});
app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    // console.log('slug -> ', slug);
    const room = await prismaClient.room.findFirst({
        where: {
            slug,
        },
    });

    res.status(200).json({
        room,
    });
});
// GET all strokes in a room
app.get("/rooms/:roomId/strokes", async (req, res) => {
    const roomId = Number(req.params.roomId);
    console.log("roomId selected is --> ", roomId);
    if (isNaN(roomId)) {
        res.status(400).json({ message: "Invalid roomId" });
        return;
    }

    try {
        const strokes = await prismaClient.strokes.findMany({
            where: { roomId },
            orderBy: { createdAt: "asc" },
        });

        res.status(200).json(strokes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch strokes" });
    }
});

// POST a new stroke into a room
// POST a new stroke into a room (with auto-room-creation)
app.post("/rooms/:roomId/strokes", userValidation, async (req, res) => {
    const roomId = Number(req.params.roomId);
    if (isNaN(roomId)) {
        res.status(400).json({ message: "Invalid roomId" });
    }

    const userId = (req as any).userID as string;
    const strokeData = req.body as {
        tool: string;
        path: { x: number; y: number }[];
    };
    if (!strokeData || !strokeData.tool || !Array.isArray(strokeData.path)) {
        res.status(400).json({ message: "Invalid stroke payload" });
    }

    try {
        // 2. Ensure the room exists
        let room = await prismaClient.room.findUnique({
            where: { id: roomId },
        });

        if (!room) {
            // 3. Auto-create a new room record
            room = await prismaClient.room.create({
                data: {
                    // override auto-inc ID; most dialects allow setting explicit IDs even on auto-inc columns
                    id: roomId,
                    slug: `room-${roomId}`,
                    adminId: userId,
                },
            });
        }

        // 4. Persist the stroke
        const stroke = await prismaClient.strokes.create({
            data: {
                roomId: room.id,
                userId,
                data: strokeData,
            },
        });

        res.status(201).json(stroke);
    } catch (err) {
        console.error("POST /rooms/:roomId/strokes error:", err);
        res.status(500).json({ message: "Failed to save stroke" });
    }
});

app.listen(3003, () => console.log("port running at 3003"));
