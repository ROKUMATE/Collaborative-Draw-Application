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
    Sun,
    Moon,
    Home,
    Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

type Tool = "select" | "pencil" | "rectangle" | "circle" | "eraser";
type DrawingPath = {
    tool: Tool;
    path: { x: number; y: number }[];
};

export default function HomeRoomID() {
    const { roomId } = useParams<{ roomId: string }>();
    const { token, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
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
                const strokes: DrawingPath[] = res.data
                    .map((rec: any) => rec.data)
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
                    authorization: `${token}`,
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
        <div
            className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
            {/* Navigation Bar */}
            <nav
                className={`fixed top-0 left-0 right-0 h-16 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-md z-50`}>
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push("/")}
                            className={`p-2 rounded-md ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                            <Home size={20} />
                        </button>
                        <span className="font-semibold">Room: {roomId}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user && (
                            <div
                                className={`flex items-center space-x-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                <Users size={20} />
                                <span>{user.username}</span>
                            </div>
                        )}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-md ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                            {theme === "dark" ? (
                                <Sun size={20} />
                            ) : (
                                <Moon size={20} />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Toolbar */}
            <div
                className={`fixed top-28 left-1/2 transform -translate-x-1/2 ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-lg shadow-lg p-2 flex gap-2`}>
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
                                ? theme === "dark"
                                    ? "bg-blue-900 text-blue-300"
                                    : "bg-blue-100 text-blue-600"
                                : theme === "dark"
                                  ? "hover:bg-gray-700"
                                  : "hover:bg-gray-100"
                        }`}>
                        <Icon size={20} />
                    </button>
                ))}
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
                <button
                    onClick={handleUndo}
                    disabled={!undoStack.length}
                    className={`p-2 rounded ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                    <Undo size={20} />
                </button>
                <button
                    onClick={handleRedo}
                    disabled={!redoStack.length}
                    className={`p-2 rounded ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                    <Redo size={20} />
                </button>
                <button
                    onClick={handleDownload}
                    className={`p-2 rounded ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                    <Download size={20} />
                </button>
            </div>

            {/* Canvas */}
            <div className="flex items-center justify-center pt-44">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-lg shadow-lg cursor-crosshair`}
                />
            </div>
        </div>
    );
}
