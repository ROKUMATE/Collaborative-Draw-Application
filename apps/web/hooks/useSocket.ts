'use client';

import { useEffect, useState } from 'react';
import { BACKEND_WS_URL } from '../app/config';

export function useSocket() {
    const [socket, setSocket] = useState<WebSocket>();
    const [loading, setLoading] = useState<Boolean>(true);

    useEffect(() => {
        // token example - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIxMjVlZDYwZC00OTkyLTRlN2QtYWE2My04ODExMTIwNGY3MmMiLCJpYXQiOjE3NDE5MzgyODV9.KV8RVcxW_nyTNUem3Vs3CIRvm9r_S65iUr7Pc-cDxUM
        // const ws = new WebSocket(`${BACKEND_WS_URL}?token=${token}`);
        const ws = new WebSocket(
            `${BACKEND_WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIxMjVlZDYwZC00OTkyLTRlN2QtYWE2My04ODExMTIwNGY3MmMiLCJpYXQiOjE3NDE5MzgyODV9.KV8RVcxW_nyTNUem3Vs3CIRvm9r_S65iUr7Pc-cDxUM`
        );
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        };
    }, []);

    return {
        socket,
        loading,
    };
}

// import { useEffect, useState } from 'react';
// import { BACKEND_WS_URL } from '../app/config';

// export function useSocket() {
//     const [loading, setLoading] = useState(true);
//     const [socket, setSocket] = useState<WebSocket>();

//     useEffect(() => {
//         const ws = new WebSocket(
//             `${BACKEND_WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIxMjVlZDYwZC00OTkyLTRlN2QtYWE2My04ODExMTIwNGY3MmMiLCJpYXQiOjE3NDE5MzgyODV9.KV8RVcxW_nyTNUem3Vs3CIRvm9r_S65iUr7Pc-cDxUM`
//         );
//         ws.onopen = () => {
//             setLoading(false);
//             setSocket(ws);
//         };
//     }, []);

//     return {
//         socket,
//         loading,
//     };
// }
