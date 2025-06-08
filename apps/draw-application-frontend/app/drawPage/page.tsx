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
} from 'lucide-react';

type Tool = 'select' | 'pencil' | 'rectangle' | 'circle' | 'eraser';
type DrawingPath = {
    tool: Tool;
    path: { x: number; y: number }[];
};

function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState<Tool>('pencil');
    const [paths, setPaths] = useState<DrawingPath[]>([]);
    const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>(
        []
    );
    const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]);
    const [redoStack, setRedoStack] = useState<DrawingPath[][]>([]);

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

        // Set canvas size
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;

        // Clear canvas
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw all paths
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

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Toolbar */}
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex gap-2">
                {tools.map((tool) => (
                    <button
                        key={tool.name}
                        onClick={() => setCurrentTool(tool.name as Tool)}
                        className={`p-2 rounded ${
                            currentTool === tool.name
                                ? 'bg-blue-100 text-blue-600'
                                : 'hover:bg-gray-100'
                        }`}>
                        <tool.icon size={20} />
                    </button>
                ))}
                <div className="w-px bg-gray-200 mx-2" />
                <button
                    onClick={handleUndo}
                    className="p-2 rounded hover:bg-gray-100"
                    disabled={undoStack.length === 0}>
                    <Undo size={20} />
                </button>
                <button
                    onClick={handleRedo}
                    className="p-2 rounded hover:bg-gray-100"
                    disabled={redoStack.length === 0}>
                    <Redo size={20} />
                </button>
                <div className="w-px bg-gray-200 mx-2" />
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

export default Home;
