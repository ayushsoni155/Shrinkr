'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Zap, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        // TODO: wire to backend forgot-password endpoint when implemented
        await new Promise((r) => setTimeout(r, 1200));
        setLoading(false);
        setSubmitted(true);
    }

    return (
        <div className="min-h-screen bg-surface-0 flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
            <div className="relative w-full max-w-md animate-slide-up">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">Shrinkr</span>
                </div>
                <div className="glass rounded-2xl p-8">
                    {submitted ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
                            <p className="text-zinc-400 text-sm mb-6">
                                If an account with <span className="text-white">{email}</span> exists, we've sent password reset instructions.
                            </p>
                            <Link href="/auth/login">
                                <Button variant="secondary" className="w-full">Back to login</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
                                <p className="text-zinc-400 text-sm mt-1">No worries. Enter your email and we'll send you reset instructions.</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                                    <input type="email" className="input-base" placeholder="you@example.com"
                                        value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
                            </form>
                            <div className="text-center mt-5">
                                <Link href="/auth/login" className="text-sm text-zinc-500 hover:text-brand-400 transition-colors flex items-center justify-center gap-1">
                                    <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
