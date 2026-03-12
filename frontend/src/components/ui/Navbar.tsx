'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Zap, LayoutDashboard, LogOut, BarChart3 } from 'lucide-react';

export function Navbar() {
    const router = useRouter();
    const { user, logout } = useAuthStore();

    function handleLogout() {
        logout();
        router.push('/auth/login');
    }

    return (
        <header className="sticky top-0 z-50 border-b border-surface-300/50 bg-surface-0/80 backdrop-blur-xl">
            <div className="flex items-center justify-between max-w-7xl mx-auto px-6 h-14">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-bold text-white text-sm">Shrinkr</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-1">
                        <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-surface-300 rounded-lg transition-colors">
                            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 hidden sm:block">{user?.email}</span>
                    <button onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
