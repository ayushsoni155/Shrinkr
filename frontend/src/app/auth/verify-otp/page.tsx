'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { apiVerifyOtp, apiResendOtp } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Zap, Mail } from 'lucide-react';

export default function VerifyOtpPage() {
    const router = useRouter();
    const { pendingEmail, setAuth } = useAuthStore();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    function handleChange(index: number, value: string) {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }

    function handleKeyDown(index: number, e: React.KeyboardEvent) {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }

    function handlePaste(e: React.ClipboardEvent) {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
        e.preventDefault();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const otpStr = otp.join('');
        if (otpStr.length < 6) { setError('Enter all 6 digits'); return; }
        setLoading(true);
        setError('');
        try {
            const { data } = await apiVerifyOtp(pendingEmail!, otpStr);
            setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        if (!pendingEmail) return;
        setResendLoading(true);
        try {
            await apiResendOtp(pendingEmail);
            setSuccess('OTP resent! Check your inbox.');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setResendLoading(false);
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
                    <div className="flex justify-center mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-brand-600/15 flex items-center justify-center">
                            <Mail className="w-7 h-7 text-brand-400" />
                        </div>
                    </div>
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-white">Check your email</h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            We sent a 6-digit code to{' '}
                            <span className="text-white font-medium">{pendingEmail || 'your email'}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">{success}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className="w-12 h-14 text-center text-xl font-bold bg-surface-200 border border-surface-300 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                />
                            ))}
                        </div>
                        <Button type="submit" loading={loading} className="w-full">Verify email</Button>
                    </form>

                    <div className="text-center mt-5">
                        <button onClick={handleResend} disabled={resendLoading}
                            className="text-sm text-zinc-500 hover:text-brand-400 transition-colors disabled:opacity-50">
                            {resendLoading ? 'Resending...' : "Didn't receive it? Resend code"}
                        </button>
                    </div>
                    <div className="text-center mt-3">
                        <Link href="/auth/signup" className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
                            ← Back to signup
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
