'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import ShortUniqueId from 'short-unique-id';

export function ChatRoomClient({
    message,
    id,
}: {
    message: { message: string }[];
    id: string;
}) {
    // this initiate the socket connection to the server
    // message array of messages
    // Define a hook for connecting to the socket useSocket
    const uid = new ShortUniqueId();
    const [chats, setChats] = useState(message);
    const [chatMessage, setChatMessage] = useState('');
    const { socket, loading } = useSocket();

    useEffect(() => {
        if (socket && !loading) {
            socket.send(
                JSON.stringify({
                    type: 'join_room',
                    roomId: `${id}`,
                })
            );

            socket.onmessage = (event) => {
                // alert(event.data);
                const parsedData = JSON.parse(event.data);
                // alert(parsedData.type);
                if (parsedData.type === 'chat') {
                    // alert('Message received ');
                    setChats((chats) => [
                        { message: parsedData.message },
                        ...chats,
                    ]);
                }
            };
        }
    }, [socket, loading, id]);

    function sendMessage() {
        if (!socket || loading) {
            alert('you are not connected to the ws socket ');
            return;
        }

        const parsedData = JSON.stringify({
            type: 'chat',
            roomId: `${id}`,
            message: chatMessage,
        });

        socket.send(parsedData);
        setChatMessage('');
    }

    return (
        <div
            style={{
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'center',
            }}>
            <div
                style={{
                    justifyContent: 'end',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '80vh',
                }}>
                {chats.map((m) => (
                    <div key={uid.rnd()}> -- {m.message}</div>
                ))}
            </div>
            <div
                style={{
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'row',
                    alignContent: 'center',
                    height: '5vh',
                    margin: '10px',
                    gap: '10px',
                }}>
                <input
                    style={{
                        width: '160px',
                    }}
                    type="string"
                    onChange={(e) => {
                        setChatMessage(e.target.value);
                    }}
                    placeholder="Enter Your Chat Message"></input>
                <button
                    style={{
                        width: '100px',
                    }}
                    onClick={() => sendMessage()}>
                    Send
                </button>
            </div>{' '}
        </div>
    );
}
