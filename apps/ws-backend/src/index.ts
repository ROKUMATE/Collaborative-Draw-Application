import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/db";

const wss = new WebSocketServer({ port: 8080 });

/**
 *  Bad Way of making the ws filled with state and local data management!
 */
interface User {
    ws: WebSocket;
    rooms: string[];
    userId: string;
}

const users: User[] = [];

/* 
    Checking for the Authentication of the user by the jwt token
*/
function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded == "string" || !decoded || !decoded.userID)
            return null;
        return decoded.userID;
    } catch (error) {
        console.log("There was an error ->", error);
        return null;
    }
}

wss.on("connection", function connection(ws, request) {
    const url = request.url;
    if (!url) return;
    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") || "";
    const userId = checkUser(token);
    if (!userId) {
        ws.close();
        return null;
    }
    /**
     * Adding the user to the ws array list
     */
    users.push({
        userId,
        rooms: [],
        ws,
    });

    console.log("userID of the user connected ->", userId);

    ws.on("message", async function message(data) {
        const parsedData = JSON.parse(data as unknown as string);
        console.log("parsedData -> ", parsedData);

        // Joining the room
        /**
         * JSON Data 
            {
                "type": "join_room",
                "roomId": "2"
            }
         */
        if (parsedData.type === "join_room") {
            const user = users.find((x) => x.ws === ws);
            user?.rooms.push(parsedData.roomId);
        }

        // Leaving the room
        /**
         * JSON DATA
            {
                "type": "leave_room",
                "roomId": "1"
            }
         */
        if (parsedData.type === "leave_room") {
            const user = users.find((x) => x.ws === ws);
            if (!user) return;
            user.rooms = user.rooms.filter((x) => x == parsedData.roomId);
        }

        // Chating
        /** JSON DATA
            {
                "type": "chat",
                "roomId": "1",
                "message": "Chatting message" 
            }
         */
        if (parsedData.type === "chat") {
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            await prismaClient.chat.create({
                data: { roomId: Number(roomId), message, userId },
            });
            users.forEach((user) => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(
                        JSON.stringify({
                            type: "chat",
                            roomId,
                            message,
                        })
                    );
                }
            });
        }
    });
});
