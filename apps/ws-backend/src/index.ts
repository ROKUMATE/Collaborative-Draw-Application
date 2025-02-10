import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { JWT_SECRET } from './config';

const wss = new WebSocketServer({ port: 8080 });

const decodedSchema = z.object({
    userID: z.number(),
});

wss.on('connection', function connection(ws, request) {
    const url = request.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token');
    try {
        const decoded = jwt.verify(token as string, JWT_SECRET);
        if (
            typeof decoded === 'object' &&
            decoded !== null &&
            'userID' in decoded
        ) {
            const parsed = decodedSchema.safeParse(decoded);
            if (!parsed.success) {
                console.log('token not valid');
                ws.close();
                return;
            }
        } else {
            ws.close();
            return;
        }
    } catch (error) {
        console.log(error);
        ws.close();
        return;
    }
    ws.on('message', function message(data) {
        ws.send('Sending the ws message');
    });
});
