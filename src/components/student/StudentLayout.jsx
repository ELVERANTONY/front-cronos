import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StudentDock from './StudentDock';
import CronosAssistant from '../assistant/CronosAssistant';
import { Menu } from 'lucide-react';

const StudentLayout = () => {
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState('Dashboard');

    // Update title based on route
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/dashboard')) setPageTitle('Inicio');
        else if (path.includes('/explore')) setPageTitle('Explorar');
        else if (path.includes('/chats')) setPageTitle('Chats');
        else if (path.includes('/chat/')) setPageTitle('Chat');
        else setPageTitle('Cronos');
    }, [location]);

    return (
        <div className="flex h-screen bg-[#151922] text-white overflow-hidden font-sans selection:bg-blue-500/30">

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* Header Mobile/Desktop (Minimal) */}
                {/* Header Removed as per user request */}

                {/* Page Content */}
                <main className="flex-1 relative overflow-hidden flex flex-col">
                    {/* Dynamic Background */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                        {/* Diagonal Split */}
                        <div className="absolute top-0 right-0 w-2/3 h-full bg-[#1a1f2e] skew-x-12 translate-x-1/4 opacity-50"></div>
                        {/* Glow Orbs */}
                        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
                    </div>

                    <div className={`relative z-10 w-full h-full flex flex-col ${location.pathname.includes('/chat/') || location.pathname.includes('/call/')
                        ? 'overflow-hidden'
                        : 'overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent'
                        }`}>
                        <Outlet />
                    </div>
                </main>

                {/* Floating Dock - Hidden in Chat/Call */}
                {!location.pathname.includes('/chat/') && !location.pathname.includes('/call/') && (
                    <StudentDock />
                )}

                {/* Virtual Assistant - Persistent across student pages */}
                <CronosAssistant />
            </div>
        </div>
    );
};

export default StudentLayout;
