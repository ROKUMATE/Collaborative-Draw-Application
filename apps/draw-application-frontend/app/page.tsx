"use client";

import React, { useEffect, useState } from "react";
import {
    ArrowRight,
    Pencil,
    Share2,
    Users2,
    Sparkles,
    Github,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
// import { useRouter } from "next/navigation";

function App() {
    const { token, user } = useAuth();
    // console.log("token ---> ", token);
    // const router = useRouter();
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    useEffect(() => {
        if (!token || !user) {
            setAuthenticated(false);
        } else {
            setAuthenticated(true);
        }
    }, [token, user]);
    return (
        <div className="min-h-screen bg-gray-900">
            {/* Navigation */}
            <nav className="fixed w-full bg-gray-900/80 backdrop-blur-sm z-50 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Pencil className="h-8 w-8 text-blue-500" />
                            <span className="ml-2 text-xl font-bold text-white">
                                ExcaliDraw
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors">
                                About
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors">
                                Blog
                            </a>
                            <a
                                href="http://github.com/ROKUMATE/collaborative-Draw-Application/"
                                target="_blank"
                                rel="noopener noreferrer">
                                <Github className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                            </a>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <Link href={"/drawPage"}>Open App</Link>
                            </button>
                            {authenticated ? (
                                <button className="ml-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                                    <span className="flex items-center">
                                        <Users2 className="h-4 w-4 mr-2" />
                                        {user?.username || "Profile"}
                                    </span>
                                </button>
                            ) : (
                                <>
                                    <button className="ml-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                                        <span className="flex items-center">
                                            <Users2 className="h-4 w-4 mr-2" />
                                            <Link href="/sign-in">
                                                {user?.username || "Signup"}
                                            </Link>
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-white mb-6">
                            The whiteboard you'll
                            <span className="text-blue-500">
                                {" "}
                                actually want to use
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
                            ExcaliDraw is a virtual whiteboard for sketching
                            hand-drawn like diagrams. Collaborative,
                            open-source, and completely free.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                                <Link href="/drawPage">Start Drawing </Link>
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                            <button className="border border-gray-700 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                                Try Demo
                            </button>
                        </div>
                    </div>

                    {/* Preview Image */}
                    <div className="mt-16 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                        <img
                            src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=2000&q=80"
                            alt="ExcaliDraw Preview"
                            className="w-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-gray-800 py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Share2 className="h-6 w-6 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">
                                Real-time Collaboration
                            </h3>
                            <p className="text-gray-400">
                                Work together with your team in real-time, no
                                matter where they are.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Users2 className="h-6 w-6 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">
                                Easy to Use
                            </h3>
                            <p className="text-gray-400">
                                Intuitive interface that anyone can use without
                                training.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="h-6 w-6 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">
                                Beautiful Results
                            </h3>
                            <p className="text-gray-400">
                                Create professional-looking diagrams with our
                                hand-drawn style.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                        <Pencil className="h-6 w-6 text-blue-500" />
                        <span className="ml-2 text-lg font-semibold text-white">
                            ExcaliDraw
                        </span>
                    </div>
                    <div className="flex space-x-6">
                        <a
                            href="#"
                            className="text-gray-400 hover:text-white transition-colors">
                            Privacy
                        </a>
                        <a
                            href="#"
                            className="text-gray-400 hover:text-white transition-colors">
                            Terms
                        </a>
                        <a
                            href="#"
                            className="text-gray-400 hover:text-white transition-colors">
                            Contact
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
