'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    Pencil,
    Square,
    Circle,
    Eraser,
    Download,
    Undo,
    Redo,
    Mouse,
    User,
    Sun,
    Moon,
    Plus,
    LogIn,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Tool = 'select' | 'pencil' | 'rectangle' | 'circle' | 'eraser';
type DrawingPath = {
    tool: Tool;
    path: { x: number; y: number }[];
};

function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter();
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState<Tool>('pencil');
    const [paths, setPaths] = useState<DrawingPath[]>([]);
    const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>(
        []
    );
    const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]);
    const [redoStack, setRedoStack] = useState<DrawingPath[][]>([]);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [username, setUsername] = useState('User123');
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);
    const [roomId, setRoomId] = useState('');

    const tools = [
        { name: 'select', icon: Mouse },
        { name: 'pencil', icon: Pencil },
        { name: 'rectangle', icon: Square },
        { name: 'circle', icon: Circle },
        { name: 'eraser', icon: Eraser },
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        paths.forEach(({ tool, path }) => {
            if (path.length < 2) return;

            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);

            if (tool === 'pencil' || tool === 'eraser') {
                path.forEach((point) => {
                    ctx.lineTo(point.x, point.y);
                });
            } else if (tool === 'rectangle') {
                const startPoint = path[0];
                const endPoint = path[path.length - 1];
                ctx.rect(
                    startPoint.x,
                    startPoint.y,
                    endPoint.x - startPoint.x,
                    endPoint.y - startPoint.y
                );
            } else if (tool === 'circle') {
                const startPoint = path[0];
                const endPoint = path[path.length - 1];
                const radius = Math.sqrt(
                    Math.pow(endPoint.x - startPoint.x, 2) +
                        Math.pow(endPoint.y - startPoint.y, 2)
                );
                ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
            }

            ctx.strokeStyle = tool === 'eraser' ? '#fff' : '#000';
            ctx.lineWidth = tool === 'eraser' ? 20 : 2;
            ctx.stroke();
        });
    }, [paths]);

    const startDrawing = (e: React.MouseEvent) => {
        if (currentTool === 'select') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        setCurrentPath([{ x, y }]);
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || currentTool === 'select') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCurrentPath((prev) => [...prev, { x, y }]);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        setPaths((prev) => {
            const newPaths = [
                ...prev,
                { tool: currentTool, path: currentPath },
            ];
            setUndoStack((prevUndo) => [...prevUndo, prev]);
            setRedoStack([]);
            return newPaths;
        });
    };

    const handleUndo = () => {
        if (undoStack.length === 0) return;
        const previousPaths = undoStack[undoStack.length - 1];
        setUndoStack((prev) => prev.slice(0, -1));
        setRedoStack((prev) => [...prev, paths]);
        setPaths(previousPaths);
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const nextPaths = redoStack[redoStack.length - 1];
        setRedoStack((prev) => prev.slice(0, -1));
        setUndoStack((prev) => [...prev, paths]);
        setPaths(nextPaths);
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const handleRoomNavigation = (action: 'create' | 'join') => {
        if (!roomId.trim()) return;
        router.push(`/drawPage/${roomId}`);
    };

    return (
        <div
            className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
            <div
                className={`fixed top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-lg shadow-lg z-50 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                <div className="flex gap-2 items-center">
                    {tools.map((tool) => (
                        <button
                            key={tool.name}
                            onClick={() => setCurrentTool(tool.name as Tool)}
                            className={`p-2 rounded-md border ${
                                currentTool === tool.name
                                    ? 'bg-blue-100 border-blue-400 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent'
                            }`}>
                            <tool.icon size={20} />
                        </button>
                    ))}
                </div>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-2" />
                <div className="flex gap-2 items-center">
                    <button
                        onClick={handleUndo}
                        className="p-2 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent"
                        disabled={undoStack.length === 0}>
                        <Undo size={20} />
                    </button>
                    <button
                        onClick={handleRedo}
                        className="p-2 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent"
                        disabled={redoStack.length === 0}>
                        <Redo size={20} />
                    </button>
                </div>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-2" />
                <button
                    onClick={handleDownload}
                    className="p-2 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent">
                    <Download size={20} />
                </button>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-2" />
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-gray-700/30 dark:bg-gray-700/60">
                    <User size={20} className="text-gray-300" />
                    <span className="text-sm font-medium">{username}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowCreateRoom(!showCreateRoom)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                        <Plus size={20} />
                        <span>Create Room</span>
                    </button>
                    {showCreateRoom && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4">
                            <input
                                type="text"
                                placeholder="Enter Room ID"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => handleRoomNavigation('create')}
                                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full">
                                Create
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setShowJoinRoom(!showJoinRoom)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                        <LogIn size={20} />
                        <span>Join Room</span>
                    </button>
                    {showJoinRoom && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4">
                            <input
                                type="text"
                                placeholder="Enter Room ID"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                onClick={() => handleRoomNavigation('join')}
                                className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full">
                                Join
                            </button>
                        </div>
                    )}
                </div>
                <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-md border ${
                        theme === 'dark'
                            ? 'bg-gray-700 text-yellow-400 border-transparent'
                            : 'bg-gray-200 text-gray-800 border-transparent'
                    }`}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div
                className="flex items-center justify-center"
                style={{ paddingTop: '120px' }}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className={`${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    } rounded-lg shadow-lg cursor-crosshair`}
                />
            </div>
        </div>
    );
}

export default Home;
