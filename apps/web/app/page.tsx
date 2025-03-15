'use client';
import { useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [roomId, setRoomid] = useState('');
    const router = useRouter();
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                height: '100vh',
            }}>
            <div>
                <input
                    value={roomId}
                    type="string"
                    onChange={(e) => {
                        setRoomid(e.target.value);
                    }}
                    style={{
                        alignItems: 'center',
                        height: '30px',
                        padding: '5px',
                        margin: '10px',
                        width: '300px',
                    }}
                    placeholder="Enter the RoomID "></input>
                <button
                    style={{
                        alignItems: 'center',
                        height: '30px',
                        width: '100px',
                        padding: '5px',
                        margin: '10px',
                    }}
                    onClick={() => {
                        router.push(`/room/${roomId}`);
                    }}>
                    {' '}
                    Join room
                </button>
            </div>
        </div>
    );
}
