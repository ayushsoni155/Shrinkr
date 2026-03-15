'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { apiLogin } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { Zap, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await apiLogin(form.email, form.password);
            toast({
                title: 'Welcome back!',
                description: 'You have logged in successfully.',
                variant: 'success',
            });
            setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
            router.push('/dashboard');
        } catch (err: any) {
            toast({
                title: 'Login Failed',
                description: err.response?.data?.message || 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-surface-0 flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />

            <div className="relative w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">Shrinkr</span>
                </div>

                <div className="glass rounded-2xl p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                        <p className="text-zinc-400 text-sm mt-1">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                className="input-base"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-zinc-300">Password</label>
                                <Link href="/auth/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="input-base pr-12"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" loading={loading} className="w-full mt-2">
                            Sign in
                        </Button>
                    </form>

                    <p className="text-center text-zinc-500 text-sm mt-6">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                            Sign up free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
