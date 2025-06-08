"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
    Pencil,
    Square,
    Circle,
    Eraser,
    Download,
    Undo,
    Redo,
    Mouse,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Tool = "select" | "pencil" | "rectangle" | "circle" | "eraser";
type DrawingPath = {
    tool: Tool;
    path: { x: number; y: number }[];
};

export default function HomeRoomID() {
    const { roomId } = useParams<{ roomId: string }>();
    const { token } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState<Tool>("pencil");
    const [paths, setPaths] = useState<DrawingPath[]>([]);
    const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>(
        []
    );
    const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]);
    const [redoStack, setRedoStack] = useState<DrawingPath[][]>([]);

    /* fetch saved strokes */
    useEffect(() => {
        axios
            .get(`http://localhost:3003/rooms/${roomId}/strokes`)
            .then((res) => {
                // res.data is Array<{ id, roomId, userId, data: { tool, path }, createdAt }>
                const strokes: DrawingPath[] = res.data
                    .map((rec: any) => rec.data)
                    // (optionally) filter out any malformed entries:
                    .filter(
                        (d: any): d is DrawingPath =>
                            typeof d.tool === "string" &&
                            Array.isArray(d.path) &&
                            d.path.length > 0
                    );
                setPaths(strokes);
            })
            .catch((err) => console.error("Error fetching strokes:", err));
    }, [roomId]);

    /* redraw canvas whenever paths change */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;

        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        console.log("paths: ", paths);

        paths.forEach(({ tool, path }) => {
            console.log("path ", path);
            if (path.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);

            if (tool === "pencil" || tool === "eraser") {
                path.forEach((p) => ctx.lineTo(p.x, p.y));
            } else if (tool === "rectangle") {
                const [start, end] = [path[0], path[path.length - 1]];
                ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
            } else if (tool === "circle") {
                const [start, end] = [path[0], path[path.length - 1]];
                const r = Math.hypot(end.x - start.x, end.y - start.y);
                ctx.arc(start.x, start.y, r, 0, 2 * Math.PI);
            }

            ctx.strokeStyle = tool === "eraser" ? "#fff" : "#000";
            ctx.lineWidth = tool === "eraser" ? 20 : 2;
            ctx.stroke();
        });
    }, [paths]);

    /* pointer handlers */
    const startDrawing = (e: React.MouseEvent) => {
        if (currentTool === "select") return;
        const rect = canvasRef.current!.getBoundingClientRect();
        setIsDrawing(true);
        setCurrentPath([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    };
    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || currentTool === "select") return;
        const rect = canvasRef.current!.getBoundingClientRect();
        setCurrentPath((prev) => [
            ...prev,
            { x: e.clientX - rect.left, y: e.clientY - rect.top },
        ]);
    };
    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        const newStroke = { tool: currentTool, path: currentPath };
        setUndoStack((u) => [...u, paths]);
        setRedoStack([]);
        setPaths((prev) => [...prev, newStroke]);

        axios
            .post(`http://localhost:3003/rooms/${roomId}/strokes`, newStroke, {
                headers: {
                    authorization:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2MTdhNWViMi01M2NjLTRkNmMtYTNiZi02YWZlNGVlN2ZmYTIiLCJpYXQiOjE3NDk0MTA0OTR9.08iz7iZUPuiTT3SKVFklFsZJRen0r4UYivUC6WATzjM",
                },
            })
            .catch((err) => console.error("Error saving stroke:", err));
    };

    /* toolbar actions */
    const handleUndo = () => {
        if (!undoStack.length) return;
        const prev = undoStack[undoStack.length - 1];
        setRedoStack((r) => [...r, paths]);
        setUndoStack((u) => u.slice(0, -1));
        setPaths(prev);
    };
    const handleRedo = () => {
        if (!redoStack.length) return;
        const next = redoStack[redoStack.length - 1];
        setUndoStack((u) => [...u, paths]);
        setRedoStack((r) => r.slice(0, -1));
        setPaths(next);
    };
    const handleDownload = () => {
        const link = document.createElement("a");
        link.download = "drawing.png";
        link.href = canvasRef.current!.toDataURL();
        link.click();
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Toolbar */}
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex gap-2">
                {(
                    [
                        { name: "select", icon: Mouse },
                        { name: "pencil", icon: Pencil },
                        { name: "rectangle", icon: Square },
                        { name: "circle", icon: Circle },
                        { name: "eraser", icon: Eraser },
                    ] as const
                ).map(({ name, icon: Icon }) => (
                    <button
                        key={name}
                        onClick={() => setCurrentTool(name)}
                        className={`p-2 rounded ${
                            currentTool === name
                                ? "bg-blue-100 text-blue-600"
                                : "hover:bg-gray-100"
                        }`}>
                        <Icon size={20} />
                    </button>
                ))}
                <button
                    onClick={handleUndo}
                    disabled={!undoStack.length}
                    className="p-2 rounded hover:bg-gray-100">
                    <Undo size={20} />
                </button>
                <button
                    onClick={handleRedo}
                    disabled={!redoStack.length}
                    className="p-2 rounded hover:bg-gray-100">
                    <Redo size={20} />
                </button>
                <button
                    onClick={handleDownload}
                    className="p-2 rounded hover:bg-gray-100">
                    <Download size={20} />
                </button>
            </div>

            {/* Canvas */}
            <div className="flex items-center justify-center pt-20">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="bg-white rounded-lg shadow-lg cursor-crosshair"
                />
            </div>
        </div>
    );
}
