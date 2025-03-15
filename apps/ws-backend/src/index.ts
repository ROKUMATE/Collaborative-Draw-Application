import { WebSocket, WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from '@repo/db/db';

const wss = new WebSocketServer({ port: 8080 });

interface User {
    ws: WebSocket;
    rooms: string[];
    userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded == 'string' || !decoded || !decoded.userID)
            return null;
        return decoded.userID;
    } catch (error) {
        console.log('There was an error ->', error);
        return null;
    }
}

wss.on('connection', function connection(ws, request) {
    const url = request.url;
    if (!url) return;
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || '';
    const userId = checkUser(token);
    if (!userId) {
        ws.close();
        return null;
    }

    users.push({
        userId,
        rooms: [],
        ws,
    });

    console.log('userID ->', userId);

    ws.on('message', async function message(data) {
        const parsedData = JSON.parse(data as unknown as string);
        console.log('parsedData -> ', parsedData);
        // Joining the room
        if (parsedData.type === 'join_room') {
            const user = users.find((x) => x.ws === ws);
            user?.rooms.push(parsedData.roomId);
        }

        // Leaving the room
        if (parsedData.type === 'leave_room') {
            const user = users.find((x) => x.ws === ws);
            if (!user) return;
            user.rooms = user.rooms.filter((x) => x == parsedData.roomId);
        }

        // Chating
        if (parsedData.type === 'chat') {
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            await prismaClient.chat.create({
                data: { roomId: Number(roomId), message, userId },
            });
            users.forEach((user) => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(
                        JSON.stringify({
                            type: 'chat',
                            roomId,
                            message,
                        })
                    );
                }
            });
        }
    });
});
