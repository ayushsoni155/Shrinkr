'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { apiSignup } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { Zap, Eye, EyeOff, Check } from 'lucide-react';

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: '8+ characters', valid: password.length >= 8 },
        { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
        { label: 'Number', valid: /[0-9]/.test(password) },
    ];
    if (!password) return null;
    return (
        <div className="mt-2 flex gap-3 flex-wrap">
            {checks.map((c) => (
                <span key={c.label} className={`flex items-center gap-1 text-xs ${c.valid ? 'text-green-400' : 'text-zinc-500'}`}>
                    <Check className="w-3 h-3" /> {c.label}
                </span>
            ))}
        </div>
    );
}

export default function SignupPage() {
    const router = useRouter();
    const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
    const [form, setForm] = useState({ email: '', password: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (form.password !== form.confirm) {
            toast({
                title: 'Validation Error',
                description: 'Passwords do not match.',
                variant: 'destructive',
            });
            return;
        }
        setLoading(true);
        try {
            await apiSignup(form.email, form.password);
            setPendingEmail(form.email);
            toast({
                title: 'Success',
                description: 'Account created! Please check your email for the OTP.',
                variant: 'success',
            });
            router.push('/auth/verify-otp');
        } catch (err: any) {
            toast({
                title: 'Signup Failed',
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
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">Shrinkr</span>
                </div>

                <div className="glass rounded-2xl p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-white">Create your account</h1>
                        <p className="text-zinc-400 text-sm mt-1">Start shortening links for free</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                            <input type="email" className="input-base" placeholder="you@example.com"
                                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input type={showPass ? 'text' : 'password'} className="input-base pr-12" placeholder="Min. 8 characters"
                                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <PasswordStrength password={form.password} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm Password</label>
                            <input type="password" className="input-base" placeholder="Repeat password"
                                value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
                        </div>
                        <Button type="submit" loading={loading} className="w-full mt-2">
                            Create account
                        </Button>
                    </form>

                    <p className="text-center text-zinc-500 text-sm mt-6">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
