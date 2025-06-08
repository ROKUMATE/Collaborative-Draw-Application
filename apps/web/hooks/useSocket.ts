"use client";

import { useEffect, useState } from "react";
import { BACKEND_WS_URL, TOKEN } from "../app/config";

export function useSocket() {
    const [socket, setSocket] = useState<WebSocket>();
    const [loading, setLoading] = useState<Boolean>(true);

    useEffect(() => {
        // const ws = new WebSocket(`${BACKEND_WS_URL}?token=${token}`);
        const ws = new WebSocket(`${BACKEND_WS_URL}?token=${TOKEN}`);
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
